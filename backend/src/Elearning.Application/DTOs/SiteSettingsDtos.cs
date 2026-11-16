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
}
