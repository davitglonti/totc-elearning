using System.IO;
using System.Text;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Elearning.UnitTests;

public class LocalMediaServiceTests
{
    private readonly LocalMediaService _service;
    private readonly string _testUploadDir;

    public LocalMediaServiceTests()
    {
        _testUploadDir = Path.Combine(Path.GetTempPath(), "totc_test_uploads_" + Guid.NewGuid().ToString("N"));
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Media:UploadPath", _testUploadDir }
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _service = new LocalMediaService(configuration);
    }

    [Theory]
    [InlineData("exploit.html", "text/html")]
    [InlineData("exploit.htm", "text/html")]
    [InlineData("graphic.svg", "image/svg+xml")]
    [InlineData("payload.js", "application/javascript")]
    [InlineData("style.css", "text/css")]
    [InlineData("malware.exe", "application/x-msdownload")]
    [InlineData("script.sh", "application/x-sh")]
    [InlineData("script.bat", "application/x-bat")]
    [InlineData("script.ps1", "text/plain")]
    public async Task UploadFileAsync_WhenDangerousExtension_ThrowsArgumentException(string fileName, string contentType)
    {
        // Arrange
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("alert(1)"));

        // Act
        Func<Task> act = async () => await _service.UploadFileAsync(stream, fileName, contentType);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*forbidden for security reasons*");
    }

    [Theory]
    [InlineData("document.unsupported", "application/octet-stream")]
    [InlineData("image.bmp", "image/bmp")]
    public async Task UploadFileAsync_WhenUnpermittedExtension_ThrowsArgumentException(string fileName, string contentType)
    {
        // Arrange
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("data"));

        // Act
        Func<Task> act = async () => await _service.UploadFileAsync(stream, fileName, contentType);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not permitted*");
    }

    [Fact]
    public async Task UploadFileAsync_WhenMismatchedMimeType_ThrowsArgumentException()
    {
        // Arrange: .png file with audio/mp3 content-type
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake png bytes"));

        // Act
        Func<Task> act = async () => await _service.UploadFileAsync(stream, "picture.png", "audio/mp3");

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*invalid for extension*");
    }

    [Theory]
    [InlineData("photo.jpg", "image/jpeg")]
    [InlineData("photo.jpeg", "image/jpeg")]
    [InlineData("photo.png", "image/png")]
    [InlineData("photo.webp", "image/webp")]
    [InlineData("photo.gif", "image/gif")]
    [InlineData("document.pdf", "application/pdf")]
    [InlineData("archive.zip", "application/zip")]
    [InlineData("video.mp4", "video/mp4")]
    [InlineData("video.webm", "video/webm")]
    public async Task UploadFileAsync_WhenValidExtensionAndMime_AcceptsAndSavesFile(string fileName, string contentType)
    {
        // Arrange
        var content = Encoding.UTF8.GetBytes("valid file content");
        using var stream = new MemoryStream(content);

        // Act
        var relativeUrl = await _service.UploadFileAsync(stream, fileName, contentType);

        // Assert
        relativeUrl.Should().StartWith("/uploads/");
        relativeUrl.Should().EndWith(Path.GetExtension(fileName).ToLowerInvariant());

        var savedPath = Path.Combine(_testUploadDir, Path.GetFileName(relativeUrl));
        File.Exists(savedPath).Should().BeTrue();

        // Cleanup
        if (File.Exists(savedPath)) File.Delete(savedPath);
    }
}
