using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Elearning.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Professional video delivery service integrating Bunny Stream Video CDN (dash.bunny.net/stream).
/// Powers instant lecturer video uploads, transcoding, adaptive bitrate HLS, and responsive iframe embeds.
/// </summary>
public class BunnyStreamService : IBunnyStreamService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _localUploadRoot;

    // Active Bunny credentials (loaded from configuration or updated live via Admin API)
    private static BunnyConfigDto _activeConfig = new();

    public BunnyStreamService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;

        // Initialize from configuration (environment variables / user-secrets / appsettings.Local.json)
        var libId = _configuration["BunnyStream:LibraryId"];
        var key = _configuration["BunnyStream:ApiKey"];
        var cdn = _configuration["BunnyStream:CdnHostname"];
        var tokenKey = _configuration["BunnyStream:TokenSecurityKey"] ?? _configuration["BunnyStream:TokenKey"];

        if (!string.IsNullOrWhiteSpace(libId)) _activeConfig.LibraryId = libId.Trim();
        if (!string.IsNullOrWhiteSpace(key)) _activeConfig.ApiKey = key.Trim();
        if (!string.IsNullOrWhiteSpace(cdn)) _activeConfig.CdnHostname = cdn.Trim();
        if (!string.IsNullOrWhiteSpace(tokenKey)) _activeConfig.TokenSecurityKey = tokenKey.Trim();

        if (string.IsNullOrWhiteSpace(_activeConfig.ApiKey) || string.IsNullOrWhiteSpace(_activeConfig.LibraryId))
        {
            throw new InvalidOperationException(
                "FATAL SECURITY CONFIGURATION ERROR: BunnyStream credentials are not configured. " +
                "Configure 'BunnyStream:ApiKey' and 'BunnyStream:LibraryId' via environment variables, user-secrets, or appsettings.Local.json.");
        }

        _localUploadRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
        if (!Directory.Exists(_localUploadRoot))
        {
            Directory.CreateDirectory(_localUploadRoot);
        }
    }

    public BunnyConfigDto GetConfig()
    {
        return new BunnyConfigDto
        {
            LibraryId = _activeConfig.LibraryId,
            ApiKey = _activeConfig.ApiKey,
            CdnHostname = _activeConfig.CdnHostname,
            TokenSecurityKey = _activeConfig.TokenSecurityKey
        };
    }

    public void UpdateConfig(BunnyConfigDto config)
    {
        if (!string.IsNullOrWhiteSpace(config.LibraryId))
            _activeConfig.LibraryId = config.LibraryId.Trim();

        if (!string.IsNullOrWhiteSpace(config.ApiKey))
            _activeConfig.ApiKey = config.ApiKey.Trim();

        if (!string.IsNullOrWhiteSpace(config.CdnHostname))
            _activeConfig.CdnHostname = config.CdnHostname.Trim().Replace("https://", "").Replace("http://", "").TrimEnd('/');

        if (!string.IsNullOrWhiteSpace(config.TokenSecurityKey))
            _activeConfig.TokenSecurityKey = config.TokenSecurityKey.Trim();
    }

    public SignedVideoPlaybackDto GenerateSignedPlayback(string videoId, int ttlSeconds = 7200)
    {
        var config = _activeConfig;
        var cdnHost = string.IsNullOrWhiteSpace(config.CdnHostname) 
            ? "vz-f0959c15-d92.b-cdn.net" 
            : config.CdnHostname.Trim().Replace("https://", "").Replace("http://", "").TrimEnd('/');
            
        var tokenKey = !string.IsNullOrWhiteSpace(config.TokenSecurityKey)
            ? config.TokenSecurityKey
            : (!string.IsNullOrWhiteSpace(config.ApiKey) ? config.ApiKey : "totc_bunny_drm_token_sec_2026");

        var safeTtl = Math.Max(60, ttlSeconds);
        var expires = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + safeTtl;

        // Standard Bunny Stream Token Authentication: SHA256(tokenKey + videoId + expires) in lowercase hex
        var rawToHash = $"{tokenKey}{videoId}{expires}";
        var hashBytes = System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(rawToHash));
        var token = Convert.ToHexString(hashBytes).ToLowerInvariant();

        // Check if videoId is a local uploaded path or GUID
        var isLocal = videoId.StartsWith("/uploads/") || videoId.StartsWith("uploads/");
        if (isLocal)
        {
            var localPath = videoId.StartsWith("/") ? videoId : $"/{videoId}";
            return new SignedVideoPlaybackDto
            {
                VideoId = videoId,
                EmbedUrl = $"{localPath}?token={token}&expires={expires}",
                HlsUrl = $"{localPath}?token={token}&expires={expires}",
                DirectPlayUrl = $"{localPath}?token={token}&expires={expires}",
                ExpiresAt = expires,
                Token = token,
                TtlSeconds = safeTtl
            };
        }

        return new SignedVideoPlaybackDto
        {
            VideoId = videoId,
            EmbedUrl = $"https://iframe.mediadelivery.net/embed/{config.LibraryId}/{videoId}?token={token}&expires={expires}",
            HlsUrl = $"https://{cdnHost}/{videoId}/playlist.m3u8?token={token}&expires={expires}",
            DirectPlayUrl = $"https://{cdnHost}/{videoId}/play_720p.mp4?token={token}&expires={expires}",
            ExpiresAt = expires,
            Token = token,
            TtlSeconds = safeTtl
        };
    }

    public async Task<(bool Success, string Message, int TotalVideos)> TestConnectionAsync()
    {
        var config = _activeConfig;
        if (string.IsNullOrWhiteSpace(config.LibraryId) || string.IsNullOrWhiteSpace(config.ApiKey))
        {
            return (false, "Bunny Stream Library ID or API Key is missing.", 0);
        }

        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, $"https://video.bunnycdn.com/library/{config.LibraryId}/videos?page=1&itemsPerPage=1");
            req.Headers.Add("AccessKey", config.ApiKey);
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var resp = await _httpClient.SendAsync(req);
            var content = await resp.Content.ReadAsStringAsync();

            if (resp.IsSuccessStatusCode)
            {
                int total = 0;
                try
                {
                    using var doc = JsonDocument.Parse(content);
                    if (doc.RootElement.TryGetProperty("totalItems", out var ti))
                    {
                        total = ti.GetInt32();
                    }
                }
                catch { }

                return (true, $"Successfully connected to Bunny Stream Library {config.LibraryId}! ({total} videos found)", total);
            }

            if ((int)resp.StatusCode == 401)
            {
                return (false, "Authentication Failed (401 Unauthorized): Please ensure the API Key matches the key copied from your Bunny Stream Video Library API tab.", 0);
            }

            return (false, $"Bunny Stream API returned HTTP {(int)resp.StatusCode}: {content}", 0);
        }
        catch (Exception ex)
        {
            return (false, $"Connection test failed: {ex.Message}", 0);
        }
    }

    public async Task<BunnyUploadResult> UploadVideoAsync(Stream fileStream, string fileName, string? videoTitle = null)
    {
        var title = !string.IsNullOrWhiteSpace(videoTitle) 
            ? videoTitle.Trim() 
            : Path.GetFileNameWithoutExtension(fileName);

        var config = _activeConfig;
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".mp4";
        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var localFilePath = Path.Combine(_localUploadRoot, uniqueFileName);

        // 1. Buffer file stream directly to disk to ensure 100% seekability and zero memory overhead
        using (var dest = new FileStream(localFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await fileStream.CopyToAsync(dest);
        }

        // 2. Attempt upload to Bunny Stream first if Library ID and API Key are present
        if (!string.IsNullOrWhiteSpace(config.LibraryId) && !string.IsNullOrWhiteSpace(config.ApiKey))
        {
            try
            {
                // Step A: Create Video Object in Bunny Video Library
                using var createReq = new HttpRequestMessage(HttpMethod.Post, $"https://video.bunnycdn.com/library/{config.LibraryId}/videos");
                createReq.Headers.Add("AccessKey", config.ApiKey);
                createReq.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                createReq.Content = new StringContent(
                    JsonSerializer.Serialize(new { title }),
                    Encoding.UTF8,
                    "application/json"
                );

                using var createResp = await _httpClient.SendAsync(createReq);
                var createContent = await createResp.Content.ReadAsStringAsync();

                if (createResp.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(createContent);
                    var videoGuid = doc.RootElement.GetProperty("guid").GetString();

                    if (!string.IsNullOrWhiteSpace(videoGuid))
                    {
                        // Step B: Upload Video Binary Stream to Bunny CDN using seekable FileStream
                        using (var readFs = new FileStream(localFilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                        {
                            using var uploadReq = new HttpRequestMessage(HttpMethod.Put, $"https://video.bunnycdn.com/library/{config.LibraryId}/videos/{videoGuid}");
                            uploadReq.Headers.Add("AccessKey", config.ApiKey);
                            uploadReq.Content = new StreamContent(readFs);
                            uploadReq.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

                            using var uploadResp = await _httpClient.SendAsync(uploadReq);
                            if (uploadResp.IsSuccessStatusCode)
                            {
                                var cdnHost = string.IsNullOrWhiteSpace(config.CdnHostname) 
                                    ? "vz-f0959c15-d92.b-cdn.net" 
                                    : config.CdnHostname;

                                return new BunnyUploadResult
                                {
                                    Success = true,
                                    VideoId = videoGuid,
                                    Title = title,
                                    EmbedUrl = $"https://iframe.mediadelivery.net/embed/{config.LibraryId}/{videoGuid}",
                                    HlsUrl = $"https://{cdnHost}/{videoGuid}/playlist.m3u8",
                                    DirectPlayUrl = $"https://{cdnHost}/{videoGuid}/play_720p.mp4",
                                    ThumbnailUrl = $"https://{cdnHost}/{videoGuid}/thumbnail.jpg",
                                    IsBunnyStream = true,
                                    Message = "Video uploaded and encoded successfully on Bunny Stream Edge CDN."
                                };
                            }
                            else
                            {
                                var uploadErr = await uploadResp.Content.ReadAsStringAsync();
                                Console.WriteLine($"[BunnyStream] Binary upload failed (HTTP {(int)uploadResp.StatusCode}): {uploadErr}");
                            }
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"[BunnyStream] Create video failed (HTTP {(int)createResp.StatusCode}): {createContent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BunnyStream] Upload failed: {ex.Message}. Falling back to resilient server storage.");
            }
        }

        // 3. Resilient Fallback: The video is already safely saved in local storage!
        var localUrl = $"/uploads/videos/{uniqueFileName}";
        return new BunnyUploadResult
        {
            Success = true,
            VideoId = Guid.NewGuid().ToString(),
            Title = title,
            EmbedUrl = localUrl,
            HlsUrl = localUrl,
            DirectPlayUrl = localUrl,
            ThumbnailUrl = "/assets/classroom_feature.png",
            IsBunnyStream = false,
            Message = "Uploaded to server video storage."
        };
    }
}
