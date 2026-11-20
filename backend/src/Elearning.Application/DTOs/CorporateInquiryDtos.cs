using System;
using System.ComponentModel.DataAnnotations;

namespace Elearning.Application.DTOs;

public class CreateCorporateInquiryDto
{
    [Required(ErrorMessage = "კომპანიის დასახელება სავალდებულოა")]
    [MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "საკონტაქტო პირის სახელი და გვარი სავალდებულოა")]
    [MaxLength(150)]
    public string ContactPerson { get; set; } = string.Empty;

    [Required(ErrorMessage = "ელ-ფოსტა სავალდებულოა")]
    [EmailAddress(ErrorMessage = "არასწორი ელ-ფოსტის ფორმატი")]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "ტელეფონის ნომერი სავალდებულოა")]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "თანამშრომელთა რაოდენობა სავალდებულოა")]
    [MaxLength(50)]
    public string TeamSize { get; set; } = string.Empty; // e.g. "5-20", "20-50", "50-100", "100+"

    [MaxLength(300)]
    public string? Interests { get; set; }

    [MaxLength(2000)]
    public string? Message { get; set; }
}

public class CorporateInquiryDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string TeamSize { get; set; } = string.Empty;
    public string? Interests { get; set; }
    public string? Message { get; set; }
    public string Status { get; set; } = "New";
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdateCorporateInquiryStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Contacted"; // "New", "Contacted", "InDiscussion", "Closed"

    [MaxLength(1000)]
    public string? AdminNotes { get; set; }
}
