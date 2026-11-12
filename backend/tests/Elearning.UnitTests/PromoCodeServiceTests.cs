using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Elearning.UnitTests;

public class PromoCodeServiceTests
{
    private readonly ElearningDbContext _context;
    private readonly PromoCodeService _service;

    public PromoCodeServiceTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _service = new PromoCodeService(_context);
    }

    [Fact]
    public async Task ValidatePromoCodeAsync_ValidPercentageCode_CalculatesDiscountCorrectly()
    {
        // Arrange
        var promo = new PromoCode
        {
            Code = "SAVE20",
            DiscountPercentage = 20.00m,
            IsActive = true,
            ValidFrom = DateTime.UtcNow.AddDays(-1),
            ValidUntil = DateTime.UtcNow.AddDays(30),
            MaxUsageCount = 100,
            CurrentUsageCount = 0
        };
        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();

        var request = new ValidatePromoCodeRequestDto
        {
            Code = "SAVE20",
            Amount = 150.00m
        };

        // Act
        var result = await _service.ValidatePromoCodeAsync(request);

        // Assert
        result.Valid.Should().BeTrue();
        result.DiscountPercentage.Should().Be(20.00m);
        result.DiscountAmount.Should().Be(30.00m); // 20% of 150 = 30
        result.FinalAmount.Should().Be(120.00m);
    }

    [Fact]
    public async Task ValidatePromoCodeAsync_MaxDiscountCap_LimitsDiscount()
    {
        // Arrange
        var promo = new PromoCode
        {
            Code = "HALFOFF",
            DiscountPercentage = 50.00m,
            MaxDiscountAmount = 40.00m, // Capped at $40
            IsActive = true,
            ValidFrom = DateTime.UtcNow.AddDays(-1),
            ValidUntil = DateTime.UtcNow.AddDays(30),
            MaxUsageCount = 100,
            CurrentUsageCount = 0
        };
        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();

        var request = new ValidatePromoCodeRequestDto
        {
            Code = "HALFOFF",
            Amount = 200.00m // 50% would be 100, but capped at 40
        };

        // Act
        var result = await _service.ValidatePromoCodeAsync(request);

        // Assert
        result.Valid.Should().BeTrue();
        result.DiscountAmount.Should().Be(40.00m);
        result.FinalAmount.Should().Be(160.00m);
    }

    [Fact]
    public async Task ValidatePromoCodeAsync_ExpiredCode_ReturnsInvalid()
    {
        // Arrange
        var promo = new PromoCode
        {
            Code = "EXPIRED",
            DiscountPercentage = 10.00m,
            IsActive = true,
            ValidFrom = DateTime.UtcNow.AddDays(-30),
            ValidUntil = DateTime.UtcNow.AddDays(-1), // Expired yesterday
            MaxUsageCount = 100,
            CurrentUsageCount = 0
        };
        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();

        var request = new ValidatePromoCodeRequestDto
        {
            Code = "EXPIRED",
            Amount = 100.00m
        };

        // Act
        var result = await _service.ValidatePromoCodeAsync(request);

        // Assert
        result.Valid.Should().BeFalse();
        result.Message.Should().Contain("expired");
    }

    [Fact]
    public async Task ValidatePromoCodeAsync_MaxUsageReached_ReturnsInvalid()
    {
        // Arrange
        var promo = new PromoCode
        {
            Code = "MAXEDOUT",
            DiscountPercentage = 15.00m,
            IsActive = true,
            ValidFrom = DateTime.UtcNow.AddDays(-1),
            ValidUntil = DateTime.UtcNow.AddDays(30),
            MaxUsageCount = 5,
            CurrentUsageCount = 5 // Maxed out
        };
        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();

        var request = new ValidatePromoCodeRequestDto
        {
            Code = "MAXEDOUT",
            Amount = 100.00m
        };

        // Act
        var result = await _service.ValidatePromoCodeAsync(request);

        // Assert
        result.Valid.Should().BeFalse();
        result.Message.Should().Contain("usage limit");
    }
}
