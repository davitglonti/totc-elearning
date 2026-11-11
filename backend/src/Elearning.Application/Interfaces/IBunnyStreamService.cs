namespace Elearning.Application.Interfaces;

public class BunnyUploadResult
{
    public bool Success { get; set; }
    public string VideoId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string EmbedUrl { get; set; } = string.Empty;
    public string HlsUrl { get; set; } = string.Empty;
    public string DirectPlayUrl { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public bool IsBunnyStream { get; set; } = true;
    public string? Message { get; set; }
}

public class BunnyConfigDto
{
    public string LibraryId { get; set; } = "805955";
    public string ApiKey { get; set; } = string.Empty;
    public string CdnHostname { get; set; } = "vz-f0959c15-d92.b-cdn.net";
}

public interface IBunnyStreamService
{
    BunnyConfigDto GetConfig();
    void UpdateConfig(BunnyConfigDto config);
    Task<(bool Success, string Message, int TotalVideos)> TestConnectionAsync();
    Task<BunnyUploadResult> UploadVideoAsync(Stream fileStream, string fileName, string? videoTitle = null);
}
