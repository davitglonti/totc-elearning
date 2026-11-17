using System.IO;
using Elearning.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements media file upload storage into local static directory.
/// Strictly enforces extension allowlisting and MIME type verification to prevent Stored XSS.
/// </summary>
public class LocalMediaService : IMediaService
{
    private readonly string _uploadRoot;

    // Strict allowlist of permitted extensions with corresponding valid MIME types
    private static readonly Dictionary<string, string[]> AllowedExtensionsWithMime = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".jpg", new[] { "image/jpeg", "image/pjpeg" } },
        { ".jpeg", new[] { "image/jpeg", "image/pjpeg" } },
        { ".png", new[] { "image/png" } },
        { ".webp", new[] { "image/webp" } },
        { ".gif", new[] { "image/gif" } },
        { ".pdf", new[] { "application/pdf" } },
        { ".zip", new[] { "application/zip", "application/x-zip-compressed", "application/octet-stream" } },
        { ".mp4", new[] { "video/mp4" } },
        { ".webm", new[] { "video/webm" } }
    };

    // Explicit blacklist of dangerous active content / executable extensions
    private static readonly HashSet<string> ForbiddenExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".html", ".htm", ".svg", ".js", ".mjs", ".css", ".exe", ".sh", ".bat", ".ps1", ".cmd", ".vbs", ".php", ".asp", ".aspx", ".jsp", ".jar", ".dll", ".com", ".scr"
    };

    public LocalMediaService(IConfiguration config)
    {
        // Defaults to wwwroot/uploads under the running directory
        var configuredPath = config["Media:UploadPath"];
        _uploadRoot = !string.IsNullOrWhiteSpace(configuredPath)
            ? configuredPath
            : Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        if (!Directory.Exists(_uploadRoot))
        {
            Directory.CreateDirectory(_uploadRoot);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        if (fileStream == null)
            throw new ArgumentNullException(nameof(fileStream), "File content stream cannot be null.");

        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty.", nameof(fileName));

        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext))
            throw new ArgumentException("File extension is required.", nameof(fileName));

        // 1. Explicitly reject dangerous / executable / active content files
        if (ForbiddenExtensions.Contains(ext))
        {
            throw new ArgumentException($"File extension '{ext}' is forbidden for security reasons.", nameof(fileName));
        }

        // 2. Enforce strict allowlist of permitted extensions
        if (!AllowedExtensionsWithMime.TryGetValue(ext, out var permittedMimes))
        {
            throw new ArgumentException($"File extension '{ext}' is not permitted. Allowed extensions: .jpg, .jpeg, .png, .webp, .gif, .pdf, .zip, .mp4, .webm", nameof(fileName));
        }

        // 3. Validate matching MIME content-type
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            var cleanContentType = contentType.Split(';')[0].Trim().ToLowerInvariant();
            if (!permittedMimes.Contains(cleanContentType, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException($"Content-Type '{contentType}' is invalid for extension '{ext}'.", nameof(contentType));
            }
        }

        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(_uploadRoot, uniqueName);

        using (var dest = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(dest);
        }

        return $"/uploads/{uniqueName}";
    }
}
