using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service contract for promotional code validation, calculation, and management.
/// </summary>
public interface IPromoCodeService
{
    /// <summary>
    /// Validates a promotional code and calculates discount amounts if price or course is provided.
    /// </summary>
    Task<PromoCodeValidationResultDto> ValidatePromoCodeAsync(ValidatePromoCodeRequestDto dto);

    /// <summary>
    /// Lists all promotional codes for administrative review.
    /// </summary>
    Task<List<PromoCodeDto>> GetAllPromoCodesAsync();

    /// <summary>
    /// Creates a new promotional discount code.
    /// </summary>
    Task<PromoCodeDto> CreatePromoCodeAsync(CreatePromoCodeRequestDto dto);
}
