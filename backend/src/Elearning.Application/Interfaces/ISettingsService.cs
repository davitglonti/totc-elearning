using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing dynamic site settings, logo branding, and platform metadata.
/// </summary>
public interface ISettingsService
{
    Task<SiteSettingsDto> GetSettingsAsync();
    Task<SiteSettingsDto> UpdateSettingsAsync(UpdateSiteSettingsDto dto);
}
