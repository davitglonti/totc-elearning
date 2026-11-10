using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for browsing course categories.
/// </summary>
public class CategoriesController : BaseApiController
{
    private readonly ICourseService _courseService;

    public CategoriesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    /// <summary>
    /// Retrieve all course categories with active course counts.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _courseService.GetCategoriesAsync();
        return Ok(categories);
    }
}
