using System.Text;
using System.Text.Json.Serialization;
using Elearning.Application.Interfaces;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

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
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=elearning.db";
var useSqlServer = connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<ElearningDbContext>(options =>
{
    if (useSqlServer)
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

// 2. Register Application and Infrastructure Services
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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
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

// 6. Global Exception Handler Middleware with RFC 7807 Problem Details and Stack Trace Masking
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
        logger?.LogError(ex, "[GLOBAL ERROR] An unhandled exception occurred. TraceId: {TraceId}", traceId);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        if (app.Environment.IsDevelopment())
        {
            var devProblemDetails = new
            {
                type = "https://tools.ietf.org/html/rfc7807",
                title = "An internal server error occurred.",
                status = StatusCodes.Status500InternalServerError,
                detail = ex.Message,
                traceId = traceId,
                exception = ex.GetType().Name,
                stackTrace = ex.StackTrace
            };
            await context.Response.WriteAsJsonAsync(devProblemDetails);
        }
        else
        {
            var prodProblemDetails = new
            {
                type = "https://tools.ietf.org/html/rfc7807",
                title = "An internal server error occurred.",
                status = StatusCodes.Status500InternalServerError,
                detail = "An unexpected error occurred while processing your request. Please contact support quoting your Trace ID.",
                traceId = traceId
            };
            await context.Response.WriteAsJsonAsync(prodProblemDetails);
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

// 8. Serve Static Uploaded Files with CORS support
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

// 9. Automatic Database Migration and Seeding
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ElearningDbContext>();
    try
    {
        await dbContext.Database.EnsureCreatedAsync();

        try { await dbContext.Database.ExecuteSqlRawAsync("ALTER TABLE Users ADD COLUMN Headline TEXT;"); } catch { }
        try { await dbContext.Database.ExecuteSqlRawAsync("ALTER TABLE Users ADD COLUMN Education TEXT;"); } catch { }
        try { await dbContext.Database.ExecuteSqlRawAsync("ALTER TABLE Users ADD COLUMN Experience TEXT;"); } catch { }
        try { await dbContext.Database.ExecuteSqlRawAsync("ALTER TABLE Users ADD COLUMN Website TEXT;"); } catch { }

        await SeedData.InitializeAsync(dbContext);
        await SeedData.EnrichInstructorProfilesAsync(dbContext);
        await SeedData.EnrichModuleQuizzesAsync(dbContext);
        Console.WriteLine("[TOTC LMS] Database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[TOTC LMS] Error during database initialization: {ex.Message}");
    }
}

app.Run();
