using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for inspecting and managing the authenticated user's profile.
/// </summary>
[Authorize]
public class UsersController : BaseApiController
{
    private readonly IAuthService _authService;

    public UsersController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Retrieve the current authenticated user profile.
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfile()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var profile = await _authService.GetProfileAsync(CurrentUserId.Value);
        return Ok(profile);
    }

    /// <summary>
    /// Update profile bio, avatar image URL, or password.
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var updated = await _authService.UpdateProfileAsync(CurrentUserId.Value, dto);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
