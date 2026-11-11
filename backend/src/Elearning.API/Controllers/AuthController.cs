using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for student and instructor registration, JWT login, and Google sign-in.
/// </summary>
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    /// Authenticate or register with Google OAuth profile.
    /// Temporarily disabled for security hardening pending GoogleJsonWebSignature client ID verification.
    /// </summary>
    [HttpPost("google")]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GoogleAuth([FromBody] GoogleAuthDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented, new
        {
            message = "Google authentication endpoint is temporarily disabled for security hardening. Server-side Google ID token signature verification (GoogleJsonWebSignature) is required before Google OAuth can be enabled."
        });
    }
}
