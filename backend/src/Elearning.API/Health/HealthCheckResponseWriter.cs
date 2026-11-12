using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Elearning.API.Health;

/// <summary>
/// Custom JSON serializer for health check endpoints, returning structured diagnostic telemetry.
/// </summary>
public static class HealthCheckResponseWriter
{
    public static Task WriteResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            totalDuration = $"{report.TotalDuration.TotalMilliseconds:F2}ms",
            timestamp = DateTime.UtcNow.ToString("o"),
            entries = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = $"{e.Value.Duration.TotalMilliseconds:F2}ms",
                tags = e.Value.Tags,
                data = e.Value.Data,
                error = e.Value.Exception?.Message
            })
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}
