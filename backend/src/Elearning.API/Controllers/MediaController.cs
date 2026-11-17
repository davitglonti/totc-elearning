using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for delivering protected curriculum media (PDFs, ZIPs, lesson attachments, videos).
/// Enforces enrollment, active Pro subscription, or course instructor/admin authorization.
/// </summary>
public class MediaController : BaseApiController
{
    private readonly IMediaService _mediaService;
    private readonly IConfiguration _configuration;

    public MediaController(IMediaService mediaService, IConfiguration configuration)
    {
        _mediaService = mediaService;
        _configuration = configuration;
    }

    /// <summary>
    /// Stream or download protected course media files with authorization verification.
    /// Supports Bearer token authorization header or ?token=&lt;jwt&gt; query parameter.
    /// </summary>
    [HttpGet("secure/{fileName}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status206PartialContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSecureMedia(string fileName, [FromQuery] string? token = null)
    {
        var principal = ResolvePrincipal(token);
        var userId = GetUserIdFromPrincipal(principal);
        var isAdmin = principal?.IsInRole("Admin") == true || (principal?.FindFirst(ClaimTypes.Role)?.Value == "Admin");

        var hasAccess = await _mediaService.CanAccessProtectedMediaAsync(fileName, userId, isAdmin);
        if (!hasAccess)
        {
            if (principal == null)
            {
                return Unauthorized(new { message = "Authentication required to access this course media." });
            }
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You do not have permission to access this protected course media." });
        }

        var filePath = _mediaService.GetProtectedFilePath(fileName);
        if (string.IsNullOrWhiteSpace(filePath) || !System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Requested media file was not found." });
        }

        var contentType = _mediaService.GetContentType(fileName);
        var downloadName = System.IO.Path.GetFileName(filePath);

        return PhysicalFile(filePath, contentType, downloadName, enableRangeProcessing: true);
    }

    private ClaimsPrincipal? ResolvePrincipal(string? queryToken)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return User;
        }

        if (string.IsNullOrWhiteSpace(queryToken))
        {
            return null;
        }

        var secret = _configuration["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(secret)) return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secret);

        try
        {
            var principal = tokenHandler.ValidateToken(queryToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.FromMinutes(5)
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private static Guid? GetUserIdFromPrincipal(ClaimsPrincipal? principal)
    {
        if (principal == null) return null;
        var claim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? principal.FindFirst("sub")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
