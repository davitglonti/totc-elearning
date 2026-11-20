using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for corporate enterprise training inquiries and administrative review.
/// </summary>
[Route("api/corporate-inquiries")]
[Route("api/corporateinquiries")]
public class CorporateInquiriesController : BaseApiController
{
    private readonly ElearningDbContext _dbContext;

    public CorporateInquiriesController(ElearningDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Submit a corporate / campus inquiry from the membership portal.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CorporateInquiryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateCorporateInquiryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var inquiry = new CorporateInquiry
        {
            CompanyName = dto.CompanyName.Trim(),
            ContactPerson = dto.ContactPerson.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone.Trim(),
            TeamSize = dto.TeamSize.Trim(),
            Interests = dto.Interests?.Trim(),
            Message = dto.Message?.Trim(),
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.CorporateInquiries.Add(inquiry);
        await _dbContext.SaveChangesAsync();

        var resultDto = MapToDto(inquiry);
        return CreatedAtAction(nameof(GetInquiryById), new { id = inquiry.Id }, resultDto);
    }

    /// <summary>
    /// Retrieve single corporate inquiry by ID (Admin only).
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CorporateInquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInquiryById(Guid id)
    {
        var inquiry = await _dbContext.CorporateInquiries.FindAsync(id);
        if (inquiry == null) return NotFound(new { message = "Inquiry not found" });

        return Ok(MapToDto(inquiry));
    }

    /// <summary>
    /// Retrieve all corporate inquiries for administrator review.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<CorporateInquiryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllInquiries([FromQuery] string? status = null)
    {
        var query = _dbContext.CorporateInquiries.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(q => q.Status == status);
        }

        var list = await query
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => MapToDto(q))
            .ToListAsync();

        return Ok(list);
    }

    /// <summary>
    /// Update corporate inquiry status and admin internal notes (Admin only).
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CorporateInquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInquiryStatus(Guid id, [FromBody] UpdateCorporateInquiryStatusDto dto)
    {
        var inquiry = await _dbContext.CorporateInquiries.FindAsync(id);
        if (inquiry == null) return NotFound(new { message = "Inquiry not found" });

        inquiry.Status = dto.Status.Trim();
        if (dto.AdminNotes != null)
        {
            inquiry.AdminNotes = dto.AdminNotes.Trim();
        }
        inquiry.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return Ok(MapToDto(inquiry));
    }

    /// <summary>
    /// Delete a corporate inquiry (Admin only).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInquiry(Guid id)
    {
        var inquiry = await _dbContext.CorporateInquiries.FindAsync(id);
        if (inquiry == null) return NotFound(new { message = "Inquiry not found" });

        _dbContext.CorporateInquiries.Remove(inquiry);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static CorporateInquiryDto MapToDto(CorporateInquiry q) => new()
    {
        Id = q.Id,
        CompanyName = q.CompanyName,
        ContactPerson = q.ContactPerson,
        Email = q.Email,
        Phone = q.Phone,
        TeamSize = q.TeamSize,
        Interests = q.Interests,
        Message = q.Message,
        Status = q.Status,
        AdminNotes = q.AdminNotes,
        CreatedAt = q.CreatedAt,
        UpdatedAt = q.UpdatedAt
    };
}
