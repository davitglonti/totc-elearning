using System.IO;
using Elearning.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements media file upload storage into local static directory.
/// Can be easily swapped with Cloudinary, AWS S3, or BunnyCDN via the IMediaService interface.
/// </summary>
public class LocalMediaService : IMediaService
{
    private readonly string _uploadRoot;

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
        var ext = Path.GetExtension(fileName);
        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(_uploadRoot, uniqueName);

        using (var dest = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(dest);
        }

        return $"/uploads/{uniqueName}";
    }
}
