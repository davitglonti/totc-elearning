using Elearning.Domain.Entities;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service for generating and validating JWT tokens.
/// </summary>
public interface ITokenService
{
    string GenerateToken(User user);
}
