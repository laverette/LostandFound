using Microsoft.AspNetCore.Mvc;
using api.Services;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public ItemController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllItems()
        {
            try
            {
                var items = await _databaseService.GetAllItemsAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving items.", error = ex.Message });
            }
        }

        [HttpPost("found")]
        public async Task<IActionResult> AddFoundItem([FromBody] AddFoundItemRequest request)
        {
            try
            {
                // Validate Crimson email
                if (!IsCrimsonEmail(request.FinderEmail))
                {
                    return BadRequest(new { message = "Only @crimson.ua.edu email addresses are allowed." });
                }

                // Get or create user
                var user = await _databaseService.GetUserByEmailAsync(request.FinderEmail);
                if (user == null)
                {
                    user = await _databaseService.CreateUserAsync(request.FinderName, request.FinderEmail);
                }

                var item = new Item
                {
                    Name = request.Name,
                    Description = request.Description,
                    Building = request.Building,
                    Room = request.Room,
                    DateFound = request.DateFound ?? DateTime.UtcNow,
                    FoundByUserId = user.Id
                };

                var createdItem = await _databaseService.CreateItemAsync(item);
                return Ok(new { message = "Found item added successfully.", item = createdItem });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding the found item.", error = ex.Message });
            }
        }

        [HttpPost("missing")]
        public async Task<IActionResult> ReportMissingItem([FromBody] ReportMissingItemRequest request)
        {
            try
            {
                // Validate Crimson email
                if (!IsCrimsonEmail(request.ReporterEmail))
                {
                    return BadRequest(new { message = "Only @crimson.ua.edu email addresses are allowed." });
                }

                // Get or create user
                var user = await _databaseService.GetUserByEmailAsync(request.ReporterEmail);
                if (user == null)
                {
                    user = await _databaseService.CreateUserAsync(request.ReporterName, request.ReporterEmail);
                }

                var missingItem = new MissingItem
                {
                    Name = request.Name,
                    Description = request.Description,
                    Building = request.Building,
                    Room = request.Room,
                    DateLost = request.DateLost,
                    ReportedByUserId = user.Id
                };

                var createdMissingItem = await _databaseService.CreateMissingItemAsync(missingItem);
                return Ok(new { message = "Missing item reported successfully.", missingItem = createdMissingItem });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while reporting the missing item.", error = ex.Message });
            }
        }

        private bool IsCrimsonEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return email.EndsWith("@crimson.ua.edu", StringComparison.OrdinalIgnoreCase);
        }
    }

    public class AddFoundItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string? Room { get; set; }
        public DateTime? DateFound { get; set; }
        public string FinderName { get; set; } = string.Empty;
        public string FinderEmail { get; set; } = string.Empty;
    }

    public class ReportMissingItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string? Room { get; set; }
        public DateTime? DateLost { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string ReporterEmail { get; set; } = string.Empty;
    }
}
