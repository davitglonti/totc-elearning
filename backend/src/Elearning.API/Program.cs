using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Elearning.API.Health;
using Elearning.Application.Interfaces;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Load .env file into environment variables if present (workspace root or parent dirs)
var currentDirectory = Directory.GetCurrentDirectory();
var envCandidates = new[] { currentDirectory, Path.Combine(currentDirectory, ".."), Path.Combine(currentDirectory, "..", "..") };
foreach (var dir in envCandidates)
{
    var envFilePath = Path.Combine(dir, ".env");
    if (File.Exists(envFilePath))
    {
        foreach (var rawLine in File.ReadAllLines(envFilePath))
        {
            var line = rawLine.Trim();
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
            var splitIndex = line.IndexOf('=');
            if (splitIndex > 0)
            {
                var envKey = line.Substring(0, splitIndex).Trim();
                var envVal = line.Substring(splitIndex + 1).Trim().Trim('"').Trim('\'');
                Environment.SetEnvironmentVariable(envKey, envVal);
                builder.Configuration[envKey] = envVal;
                if (envKey.Contains("__"))
                {
                    builder.Configuration[envKey.Replace("__", ":")] = envVal;
                }
            }
        }
        break;
    }
}

// Load optional local configuration, environment variables, and command-line arguments
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();
builder.Configuration.AddCommandLine(args);

// Configure Kestrel to support large video file uploads (up to 2 GB)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 2147483648; // 2 GB
});

// Configure FormOptions for multipart video uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 2147483648; // 2 GB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// 1. Configure Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=elearning;Username=postgres;Password=postgres";
var useSqlServer = connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<ElearningDbContext>(options =>
{
    if (useSqlServer)
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        options.UseNpgsql(connectionString);
    }
});

// 2. Register Application and Infrastructure Services
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient("BunnyClient", client =>
{
    client.Timeout = TimeSpan.FromMinutes(30);
});
builder.Services.AddHttpClient();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IMediaService, LocalMediaService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPromoCodeService, PromoCodeService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IVideoService, VideoService>();
builder.Services.AddScoped<IInstructorCourseService, InstructorCourseService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Health Checks & Observability
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("TOTC LMS API is alive."), tags: new[] { "live" })
    .AddCheck<DatabaseHealthCheck>("database", tags: new[] { "ready" });
// 2. Validate and Register Bunny Stream Service
var bunnyApiKey = builder.Configuration["BunnyStream:ApiKey"];
var bunnyLibId = builder.Configuration["BunnyStream:LibraryId"];
if (string.IsNullOrWhiteSpace(bunnyApiKey) || string.IsNullOrWhiteSpace(bunnyLibId))
{
    throw new InvalidOperationException(
        "FATAL SECURITY CONFIGURATION ERROR: 'BunnyStream:ApiKey' or 'BunnyStream:LibraryId' is missing or unconfigured. " +
        "Configure them via environment variables (BunnyStream__ApiKey, BunnyStream__LibraryId), .NET user-secrets, or appsettings.Local.json.");
}
builder.Services.AddSingleton<IBunnyStreamService, BunnyStreamService>();

// 3. Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
{
    throw new InvalidOperationException(
        "FATAL SECURITY CONFIGURATION ERROR: 'Jwt:Secret' is missing, empty, or insecure (must be at least 32 characters). " +
        "Configure 'Jwt:Secret' via environment variables (Jwt__Secret), .NET user-secrets, or appsettings.Local.json.");
}
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "TOTC-LMS",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "TOTC-Students",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Configure CORS
var defaultOrigins = new List<string>
{
    "http://localhost",
    "http://localhost:80",
    "https://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
};

var configuredOrigins = builder.Configuration["Cors:AllowedOrigins"];
if (!string.IsNullOrWhiteSpace(configuredOrigins))
{
    var extraOrigins = configuredOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    foreach (var origin in extraOrigins)
    {
        if (!defaultOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
        {
            defaultOrigins.Add(origin);
        }
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(defaultOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 4b. Configure API Rate Limiting Policies
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            type = "https://tools.ietf.org/html/rfc6585#section-4",
            title = "Too Many Requests",
            status = StatusCodes.Status429TooManyRequests,
            detail = "API rate limit exceeded. Please wait a moment before trying again.",
            traceId = context.HttpContext.TraceIdentifier
        }, cancellationToken: token);
    };

    // Global policy: 100 requests per minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Auth policy: 10 requests per minute per IP (protects login & register from credential stuffing)
    options.AddPolicy("auth-policy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous-auth",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Payment policy: 5 requests per minute per IP (protects checkout & webhook)
    options.AddPolicy("payment-policy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous-payment",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Support string serialization and deserialization for Enums (UserRole, CourseLevel, PaymentStatus)
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 5. Configure Swagger / OpenAPI Documentation with JWT Bearer Auth
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TOTC E-Learning (LMS) API",
        Version = "v1",
        Description = "Enterprise REST API for TOTC Learning Management System built with ASP.NET Core 9 and EF Core."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Global Exception Handler Middleware with Semantic RFC 7807 Problem Details and Stack Trace Masking
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var traceId = context.TraceIdentifier;
        var logger = context.RequestServices.GetService<ILogger<Program>>();

        if (context.Response.HasStarted)
        {
            logger?.LogWarning(ex, "[GLOBAL ERROR] Response already started, cannot write problem details. TraceId: {TraceId}", traceId);
            throw;
        }

        // Semantic exception mapping to HTTP status codes & RFC specifications
        int statusCode;
        string title;
        string type;
        string detail = ex.Message;

        switch (ex)
        {
            case UnauthorizedAccessException:
                statusCode = StatusCodes.Status403Forbidden;
                title = "Forbidden";
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.3";
                break;

            case KeyNotFoundException:
                statusCode = StatusCodes.Status404NotFound;
                title = "Not Found";
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
                break;

            case ArgumentException or InvalidOperationException:
                statusCode = StatusCodes.Status400BadRequest;
                title = "Bad Request";
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                break;

            case QuizCooldownException cooldownEx:
                statusCode = StatusCodes.Status429TooManyRequests;
                title = "Too Many Requests";
                type = "https://tools.ietf.org/html/rfc6585#section-4";
                context.Response.Headers.Append("Retry-After", cooldownEx.RemainingCooldownSeconds.ToString());
                break;

            case SubscriptionPaymentRequiredException:
                statusCode = StatusCodes.Status402PaymentRequired;
                title = "Payment Required";
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.2";
                break;

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                title = "An internal server error occurred.";
                type = "https://tools.ietf.org/html/rfc7807";
                if (!app.Environment.IsDevelopment())
                {
                    detail = "An unexpected error occurred while processing your request. Please contact support quoting your Trace ID.";
                }
                break;
        }

        if (statusCode >= 500)
        {
            logger?.LogError(ex, "[GLOBAL ERROR] An unhandled server error occurred ({StatusCode}). TraceId: {TraceId}", statusCode, traceId);
        }
        else
        {
            logger?.LogWarning(ex, "[GLOBAL HANDLER] Client error mapped ({StatusCode} {Title}): {Message}. TraceId: {TraceId}", statusCode, title, ex.Message, traceId);
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        if (app.Environment.IsDevelopment() && statusCode >= 500)
        {
            var devProblemDetails = new
            {
                type,
                title,
                status = statusCode,
                detail,
                traceId,
                exception = ex.GetType().Name,
                stackTrace = ex.StackTrace
            };
            await context.Response.WriteAsJsonAsync(devProblemDetails);
        }
        else
        {
            var problemDetails = new
            {
                type,
                title,
                status = statusCode,
                detail,
                traceId
            };
            await context.Response.WriteAsJsonAsync(problemDetails);
        }
    }
});

// 7. Enable Swagger UI in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TOTC E-Learning API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

// 8. Protect sensitive file extensions from direct anonymous static serving (RFC 7807 403 Forbidden)
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
    if (path.StartsWith("/uploads/") && 
        (path.EndsWith(".pdf") || path.EndsWith(".zip") || path.EndsWith(".mp4") || path.EndsWith(".webm")))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            title = "Forbidden",
            status = StatusCodes.Status403Forbidden,
            detail = "Direct static access to protected course files is forbidden. Access these assets via /api/media/secure/."
        });
        return;
    }
    await next();
});

// Serve Static Uploaded Files with CORS support
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check Endpoints for Docker & Kubernetes Probes
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

// 9. Automatic Database Migration and Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<ElearningDbContext>();
    var config = services.GetRequiredService<IConfiguration>();
    var env = services.GetRequiredService<IHostEnvironment>();

    try
    {
        await dbContext.Database.MigrateAsync();

        await SeedData.InitializeAsync(dbContext, config, env);
        await SeedData.EnrichInstructorProfilesAsync(dbContext);
        await SeedData.EnrichModuleQuizzesAsync(dbContext);
        await SeedData.SeedPromoCodesAsync(dbContext);
        app.Logger.LogInformation("[TOTC LMS] Database migrated and initialized successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogCritical(ex, "[TOTC LMS] Fatal error during database migration/initialization. Terminating host.");
        throw;
    }
}

app.Run();
