using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid? CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    protected string? CurrentUserEmail => 
        User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

    protected string? CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value;

    protected bool IsAdmin => CurrentUserRole == "Admin";
    protected bool IsInstructor => CurrentUserRole is "Instructor" or "Admin";
}
