using System;
using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents an enterprise or campus corporate learning package inquiry.
/// </summary>
public class CorporateInquiry : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TeamSize { get; set; } = string.Empty; // e.g. "5-20", "20-50", "50-100", "100+"
    public string? Interests { get; set; }
    public string? Message { get; set; }
    public string Status { get; set; } = "New"; // "New", "Contacted", "InDiscussion", "Closed"
    public string? AdminNotes { get; set; }
}
