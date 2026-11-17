using System.IO;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing file and video uploads to static or protected storage,
/// and gating access to restricted curriculum resources.
/// </summary>
public interface IMediaService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, bool isPublic);
    string? GetProtectedFilePath(string fileName);
    string GetContentType(string fileName);
    Task<bool> CanAccessProtectedMediaAsync(string fileName, Guid? userId, bool isAdmin);
}
