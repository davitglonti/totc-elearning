namespace Elearning.Application.DTOs;

public class SiteSettingsDto
{
    public string LogoUrl { get; set; } = string.Empty;
    public string SiteName { get; set; } = "TOTC";
    public string HeroTitle { get; set; } = "ისწავლეთ ონლაინ შეუზღუდავად";
    public string HeroSubtitle { get; set; } = "თანამედროვე საგანმანათლებლო პლატფორმა პროფესიონალური კურსებით, სერტიფიკატებითა და ინტერაქტიული ლექციებით.";
    public string ContactEmail { get; set; } = "support@totc.edu.ge";
    public string ContactPhone { get; set; } = "+995 32 200 00 00";
    public string FooterText { get; set; } = "ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა";
    public string? HomeContentJson { get; set; }
    public string? MembershipContentJson { get; set; }

    // Revenue Sharing and Payout Rules
    public int InstructorReferralShare { get; set; } = 80;
    public int PlatformReferralShare { get; set; } = 20;
    public int InstructorOrganicShare { get; set; } = 60;
    public int PlatformOrganicShare { get; set; } = 40;
    public int SubscriptionPoolShare { get; set; } = 80;
    public int PlatformSubscriptionShare { get; set; } = 20;
    public decimal MinimumPayoutThreshold { get; set; } = 50m;
    public string PayoutScheduleDays { get; set; } = "5-10";
    public int RefundBufferDays { get; set; } = 14;
}

public class UpdateSiteSettingsDto
{
    public string? LogoUrl { get; set; }
    public string? SiteName { get; set; }
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? FooterText { get; set; }
    public string? HomeContentJson { get; set; }
    public string? MembershipContentJson { get; set; }

    // Revenue Sharing and Payout Rules
    public int? InstructorReferralShare { get; set; }
    public int? PlatformReferralShare { get; set; }
    public int? InstructorOrganicShare { get; set; }
    public int? PlatformOrganicShare { get; set; }
    public int? SubscriptionPoolShare { get; set; }
    public int? PlatformSubscriptionShare { get; set; }
    public decimal? MinimumPayoutThreshold { get; set; }
    public string? PayoutScheduleDays { get; set; }
    public int? RefundBufferDays { get; set; }
}
