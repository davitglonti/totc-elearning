using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for validating promotional discount codes and managing coupons.
/// </summary>
[EnableRateLimiting("payment-policy")]
public class PromoCodesController : BaseApiController
{
    private readonly IPromoCodeService _promoCodeService;

    public PromoCodesController(IPromoCodeService promoCodeService)
    {
        _promoCodeService = promoCodeService;
    }

    /// <summary>
    /// Validate a promotional discount code and calculate discount amounts.
    /// Used by the checkout page to provide instant visual feedback.
    /// </summary>
    [HttpPost("validate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PromoCodeValidationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidatePromoCode([FromBody] ValidatePromoCodeRequestDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new PromoCodeValidationResultDto
            {
                Valid = false,
                Message = "Please enter a promo code."
            });
        }

        var result = await _promoCodeService.ValidatePromoCodeAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Validate a promo code via GET query parameters for quick checking.
    /// </summary>
    [HttpGet("validate/{code}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PromoCodeValidationResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateCode(
        [FromRoute] string code,
        [FromQuery] decimal? amount = null,
        [FromQuery] Guid? courseId = null)
    {
        var result = await _promoCodeService.ValidatePromoCodeAsync(new ValidatePromoCodeRequestDto
        {
            Code = code,
            Amount = amount,
            CourseId = courseId
        });

        return Ok(result);
    }

    /// <summary>
    /// List all promotional codes (Admin only).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<PromoCodeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPromoCodes()
    {
        var codes = await _promoCodeService.GetAllPromoCodesAsync();
        return Ok(codes);
    }

    /// <summary>
    /// Create a new promotional discount code (Admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PromoCodeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePromoCode([FromBody] CreatePromoCodeRequestDto dto)
    {
        try
        {
            var created = await _promoCodeService.CreatePromoCodeAsync(dto);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
