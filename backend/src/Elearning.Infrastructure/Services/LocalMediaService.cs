using System.IO;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements media file upload storage segregating public marketing assets from protected curriculum resources.
/// Strictly enforces extension allowlisting, MIME verification, path traversal prevention, and role-based access gating.
/// </summary>
public class LocalMediaService : IMediaService
{
    private readonly ElearningDbContext? _context;
    private readonly string _legacyUploadRoot;
    private readonly string _publicUploadRoot;
    private readonly string _protectedUploadRoot;

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

    public LocalMediaService(ElearningDbContext context, IConfiguration config)
    {
        _context = context;
        var baseDir = Directory.GetCurrentDirectory();

        var configuredPath = config["Media:UploadPath"];
        _legacyUploadRoot = !string.IsNullOrWhiteSpace(configuredPath)
            ? configuredPath
            : Path.Combine(baseDir, "wwwroot", "uploads");

        var configuredProtectedPath = config["Media:ProtectedUploadPath"];
        _protectedUploadRoot = !string.IsNullOrWhiteSpace(configuredProtectedPath)
            ? configuredProtectedPath
            : Path.Combine(baseDir, "protected_uploads");

        _publicUploadRoot = Path.Combine(_legacyUploadRoot, "public");

        Directory.CreateDirectory(_legacyUploadRoot);
        Directory.CreateDirectory(_publicUploadRoot);
        Directory.CreateDirectory(_protectedUploadRoot);
    }

    public LocalMediaService(IConfiguration config) : this(null!, config)
    {
    }

    public Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        var isImage = ext is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
        return UploadFileAsync(fileStream, fileName, contentType, isPublic: isImage);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, bool isPublic)
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

        var isImage = ext is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
        // Only images may be stored publicly; documents and videos are strictly stored in protected storage
        var shouldBePublic = isPublic && isImage;

        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var targetDir = shouldBePublic ? _publicUploadRoot : _protectedUploadRoot;
        var filePath = Path.Combine(targetDir, uniqueName);

        using (var dest = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(dest);
        }

        return shouldBePublic ? $"/uploads/public/{uniqueName}" : $"/api/media/secure/{uniqueName}";
    }

    public string? GetProtectedFilePath(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return null;

        // Path traversal sanitization: strip any directory components
        var cleanFileName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(cleanFileName)) return null;

        // 1. Check primary protected storage directory
        var protectedPath = Path.Combine(_protectedUploadRoot, cleanFileName);
        if (File.Exists(protectedPath))
        {
            return protectedPath;
        }

        // 2. Fallback: check public uploads directory
        var publicPath = Path.Combine(_publicUploadRoot, cleanFileName);
        if (File.Exists(publicPath))
        {
            return publicPath;
        }

        // 3. Fallback: check legacy wwwroot/uploads directory
        var legacyPath = Path.Combine(_legacyUploadRoot, cleanFileName);
        if (File.Exists(legacyPath))
        {
            return legacyPath;
        }

        return null;
    }

    public string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".zip" => "application/zip",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }

    public async Task<bool> CanAccessProtectedMediaAsync(string fileName, Guid? userId, bool isAdmin)
    {
        if (isAdmin)
        {
            return true;
        }

        var cleanName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(cleanName))
        {
            return false;
        }

        if (_context == null)
        {
            return userId.HasValue;
        }

        // 1. Search lessons where ResourcesJson or VideoUrl references this file
        var matchedLessons = await _context.Lessons
            .Include(l => l.Section)
            .Where(l => (l.ResourcesJson != null && l.ResourcesJson.Contains(cleanName)) ||
                        (l.VideoUrl != null && l.VideoUrl.Contains(cleanName)))
            .ToListAsync();

        if (!matchedLessons.Any())
        {
            // If not associated with any lesson, allow if user is an instructor or admin
            if (userId.HasValue)
            {
                var user = await _context.Users.FindAsync(userId.Value);
                if (user != null && user.Role is UserRole.Instructor or UserRole.Admin)
                {
                    return true;
                }
            }
            return false;
        }

        // 2. Allow if any containing lesson is marked Free Preview
        if (matchedLessons.Any(l => l.IsFreePreview))
        {
            return true;
        }

        // Unauthenticated callers cannot access non-preview course resources
        if (!userId.HasValue)
        {
            return false;
        }

        var currentUser = await _context.Users.FindAsync(userId.Value);
        if (currentUser == null)
        {
            return false;
        }

        if (currentUser.Role == UserRole.Admin)
        {
            return true;
        }

        // 3. Allow if user has an active Pro subscription
        var isSubscribed = currentUser.IsSubscribed &&
            (currentUser.SubscriptionExpiresAt == null || currentUser.SubscriptionExpiresAt > DateTime.UtcNow);

        if (isSubscribed)
        {
            return true;
        }

        // 4. Collect relevant course IDs
        var courseIds = matchedLessons
            .Select(l => l.Section?.CourseId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        if (!courseIds.Any())
        {
            return false;
        }

        // 5. Allow if user is the course instructor
        var isCourseInstructor = await _context.Courses
            .AnyAsync(c => courseIds.Contains(c.Id) && c.InstructorId == currentUser.Id);

        if (isCourseInstructor)
        {
            return true;
        }

        // 6. Allow if user is enrolled in the course
        var isEnrolled = await _context.Enrollments
            .AnyAsync(e => courseIds.Contains(e.CourseId) && e.UserId == currentUser.Id);

        return isEnrolled;
    }
}
