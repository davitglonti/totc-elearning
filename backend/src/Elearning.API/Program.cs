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
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IMediaService, LocalMediaService>();

// 3. Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "TOTC_Super_Secret_Key_For_JWT_Authentication_2026_Minimum_32_Chars!";
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

// 6. Global Exception Handler Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var errorResponse = new { error = "An internal server error occurred.", details = ex.Message };
        await context.Response.WriteAsJsonAsync(errorResponse);
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

// 8. Serve Static Uploaded Files
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowFrontend");

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
        await SeedData.InitializeAsync(dbContext);
        Console.WriteLine("[TOTC LMS] Database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[TOTC LMS] Error during database initialization: {ex.Message}");
    }
}

app.Run();
