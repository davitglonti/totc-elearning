using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

public class SettingsService : ISettingsService
{
    private readonly ElearningDbContext _context;

    private const string KeyLogoUrl = "SiteSetting:LogoUrl";
    private const string KeySiteName = "SiteSetting:SiteName";
    private const string KeyHeroTitle = "SiteSetting:HeroTitle";
    private const string KeyHeroSubtitle = "SiteSetting:HeroSubtitle";
    private const string KeyContactEmail = "SiteSetting:ContactEmail";
    private const string KeyContactPhone = "SiteSetting:ContactPhone";
    private const string KeyFooterText = "SiteSetting:FooterText";
    private const string KeyHomeContent = "SiteSetting:HomeContent";

    public SettingsService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<SiteSettingsDto> GetSettingsAsync()
    {
        var settingsList = await _context.SiteSettings
            .AsNoTracking()
            .ToListAsync();

        var dict = settingsList.ToDictionary(s => s.Key, s => s.Value);

        return new SiteSettingsDto
        {
            LogoUrl = dict.GetValueOrDefault(KeyLogoUrl, string.Empty),
            SiteName = dict.GetValueOrDefault(KeySiteName, "TOTC"),
            HeroTitle = dict.GetValueOrDefault(KeyHeroTitle, "ისწავლეთ ონლაინ შეუზღუდავად"),
            HeroSubtitle = dict.GetValueOrDefault(KeyHeroSubtitle, "თანამედროვე საგანმანათლებლო პლატფორმა პროფესიონალური კურსებით, სერტიფიკატებითა და ინტერაქტიული ლექციებით."),
            ContactEmail = dict.GetValueOrDefault(KeyContactEmail, "support@totc.edu.ge"),
            ContactPhone = dict.GetValueOrDefault(KeyContactPhone, "+995 32 200 00 00"),
            FooterText = dict.GetValueOrDefault(KeyFooterText, "ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა"),
            HomeContentJson = dict.GetValueOrDefault(KeyHomeContent, string.Empty)
        };
    }

    public async Task<SiteSettingsDto> UpdateSettingsAsync(UpdateSiteSettingsDto dto)
    {
        var existing = await _context.SiteSettings.ToListAsync();
        var dict = existing.ToDictionary(s => s.Key);

        void Upsert(string key, string? value)
        {
            if (value == null) return;
            if (dict.TryGetValue(key, out var row))
            {
                row.Value = value.Trim();
                row.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.SiteSettings.Add(new SiteSetting
                {
                    Key = key,
                    Value = value.Trim()
                });
            }
        }

        Upsert(KeyLogoUrl, dto.LogoUrl);
        Upsert(KeySiteName, dto.SiteName);
        Upsert(KeyHeroTitle, dto.HeroTitle);
        Upsert(KeyHeroSubtitle, dto.HeroSubtitle);
        Upsert(KeyContactEmail, dto.ContactEmail);
        Upsert(KeyContactPhone, dto.ContactPhone);
        Upsert(KeyFooterText, dto.FooterText);
        Upsert(KeyHomeContent, dto.HomeContentJson);

        await _context.SaveChangesAsync();

        return await GetSettingsAsync();
    }
}
