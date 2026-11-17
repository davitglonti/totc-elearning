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
    private const string KeyMembershipContent = "SiteSetting:MembershipContent";

    private static readonly string DefaultMembershipContentJson = """
    {
      "header": {
        "badgeText": "შეუზღუდავი სწავლების პაკეტი",
        "title": "მარტივი, სრული წვდომის წევრობა",
        "subtitle": "გამოიწერეთ ერთხელ და გახსენით ყველა კურსი, ვიდეო გაკვეთილი და სერტიფიკატი მთელ TOTC პლატფორმაზე.",
        "monthlyBillingText": "ყოველთვიური გადახდა",
        "annualBillingText": "წლიური გადახდა",
        "discountBadge": "დაზოგე 25%",
        "guaranteeText": "14-დღიანი თანხის დაბრუნების გარანტია. გაუქმება ნებისმიერ დროს."
      },
      "plans": [
        {
          "id": "free",
          "planId": "Free",
          "name": "უფასო სტარტერი",
          "monthlyPrice": 0,
          "annualMonthlyPrice": 0,
          "annualFullPrice": 0,
          "currency": "₾",
          "periodText": "უფასო სამუდამოდ",
          "desc": "იდეალურია დამწყები მსმენელებისთვის შესავალი ონლაინ გაკვეთილების გასაცნობად.",
          "features": [
            "წვდომა უფასო შესავალ საჩვენებელ ლექციებზე",
            "სტანდარტული სასწავლო ფორუმები და დისკუსიები",
            "წვდომა მობილურიდან და კომპიუტერიდან",
            "შეზღუდული ტესტირებები (თვეში 3 ტესტი)"
          ],
          "buttonText": "მიმდინარე უფასო პაკეტი",
          "buttonStyle": "secondary",
          "isPopular": false,
          "isEnabled": true
        },
        {
          "id": "pro",
          "planId": "Pro",
          "name": "სტუდენტური Pro სრული წვდომა",
          "monthlyPrice": 65,
          "annualMonthlyPrice": 49,
          "annualFullPrice": 588,
          "currency": "₾",
          "periodText": "/ თვეში",
          "desc": "გახსენით შეუზღუდავი წვდომა ყველა კურსზე, ვორქშოპზე და სერტიფიკატზე.",
          "features": [
            "✨ შეუზღუდავი მყისიერი წვდომა კატალოგის ყველა კურსზე",
            "პირდაპირი ვიდეო ჩართვები ინსტრუქტორებთან",
            "ავტომატური შეფასების და პროგრესის კონტროლი",
            "ინდივიდუალური პრივატული კონსულტაციები",
            "ოფიციალური ვერიფიცირებული სერტიფიკატები",
            "ოფლაინ მასალებისა და კოდის ფაილების ჩამოტვირთვა"
          ],
          "buttonText": "Pro სრული წვდომის გააქტიურება",
          "buttonStyle": "primary",
          "isPopular": true,
          "isEnabled": true
        },
        {
          "id": "enterprise",
          "planId": "Enterprise",
          "name": "ორგანიზაცია / კამპუსი",
          "monthlyPrice": 279,
          "annualMonthlyPrice": 229,
          "annualFullPrice": 2748,
          "currency": "₾",
          "periodText": "/ მომხმარებელი / თვეში",
          "desc": "შექმნილია სკოლებისთვის, უნივერსიტეტებისა და კორპორატიული აკადემიებისთვის.",
          "features": [
            "სრული Zoom API და LMS ინტეგრაცია (Canvas, Blackboard)",
            "შეუზღუდავი სტუდენტური სიები და დასწრების აღრიცხვა",
            "ადმინისტრაციული ანალიტიკის პანელი",
            "ორგანიზაციის ბრენდირება და ქვედომენი",
            "24/7 პრიორიტეტული მხარდაჭერა და დანერგვის მენეჯერი"
          ],
          "buttonText": "კორპორატიული პაკეტის გააქტიურება",
          "buttonStyle": "dark",
          "isPopular": false,
          "isEnabled": true
        }
      ]
    }
    """;

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
            HomeContentJson = dict.GetValueOrDefault(KeyHomeContent, string.Empty),
            MembershipContentJson = string.IsNullOrWhiteSpace(dict.GetValueOrDefault(KeyMembershipContent))
                ? DefaultMembershipContentJson
                : dict[KeyMembershipContent]
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
        Upsert(KeyMembershipContent, dto.MembershipContentJson);

        await _context.SaveChangesAsync();

        return await GetSettingsAsync();
    }
}
