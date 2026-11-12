using Elearning.Infrastructure.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Elearning.API.Health;

/// <summary>
/// Health check assessing database responsiveness and connectivity.
/// </summary>
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly ElearningDbContext _context;

    public DatabaseHealthCheck(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            if (canConnect)
            {
                var data = new Dictionary<string, object>
                {
                    { "provider", _context.Database.ProviderName ?? "Unknown" },
                    { "canConnect", true },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                };

                return HealthCheckResult.Healthy("Database connection is healthy and responsive.", data);
            }

            return HealthCheckResult.Unhealthy("Database connection failed. Unable to connect to data store.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy($"Database health check threw an exception: {ex.Message}", ex);
        }
    }
}
