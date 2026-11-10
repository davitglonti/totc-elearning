using System.IO;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing file and video uploads to cloud or local static storage.
/// </summary>
public interface IMediaService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
}
