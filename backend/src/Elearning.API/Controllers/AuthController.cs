using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for student and instructor registration, JWT login, and Google sign-in.
/// Protected against brute-force and credential stuffing via rate limiting.
/// </summary>
[EnableRateLimiting("auth-policy")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    /// <summary>
    /// Retrieve public authentication configuration (Google OAuth Client ID, feature flags).
    /// </summary>
    [HttpGet("config")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetAuthConfig()
    {
        var googleClientId = _configuration["Google:ClientId"] ?? string.Empty;
        return Ok(new
        {
            googleClientId = googleClientId.Trim(),
            isGoogleAuthEnabled = !string.IsNullOrWhiteSpace(googleClientId)
        });
    }

    /// <summary>
    /// Register a new student or instructor account.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (dto.Role == Elearning.Domain.Enums.UserRole.Admin || (int)dto.Role > 1 || (int)dto.Role < 0)
        {
            return BadRequest(new { message = "Direct registration as Administrator is strictly prohibited. Administrator accounts can only be provisioned via database seed or by an existing Administrator from the Admin panel." });
        }

        try
        {
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Authenticate user credentials and retrieve a JWT bearer token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Authenticate or register with verified Google OAuth ID Token (GoogleJsonWebSignature).
    /// </summary>
    [HttpPost("google")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto dto)
    {
        if (dto.Role == Elearning.Domain.Enums.UserRole.Admin || (int)dto.Role > 1 || (int)dto.Role < 0)
        {
            return BadRequest(new { message = "Direct registration as Administrator is strictly prohibited." });
        }

        try
        {
            var response = await _authService.GoogleAuthAsync(dto);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Google authentication error: {ex.Message}" });
        }
    }
}
