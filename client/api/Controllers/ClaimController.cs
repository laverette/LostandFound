using Microsoft.AspNetCore.Mvc;
using api.Services;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClaimController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public ClaimController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpPost("missing")]
        public async Task<IActionResult> ReportMissingItem([FromBody] ReportMissingItemRequest request)
        {
            try
            {
                // Validate Crimson email
                if (!IsCrimsonEmail(request.ClaimerEmail))
                {
                    return BadRequest(new { message = "Only @crimson.ua.edu email addresses are allowed." });
                }

                var claim = new Claim
                {
                    ItemName = request.ItemName,
                    LastSeenBuilding = request.LastSeenBuilding,
                    LastSeenRoom = request.LastSeenRoom,
                    ClaimerName = request.ClaimerName,
                    ClaimerEmail = request.ClaimerEmail,
                    ClaimDate = request.ClaimDate
                };

                var createdClaim = await _databaseService.CreateClaimAsync(claim);
                
                return Ok(new { 
                    message = "Missing item report submitted successfully.",
                    claim = createdClaim
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the missing item report.", error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllClaims()
        {
            try
            {
                var claims = await _databaseService.GetAllClaimsAsync();
                return Ok(claims);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving claims.", error = ex.Message });
            }
        }

        private bool IsCrimsonEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return email.EndsWith("@crimson.ua.edu", StringComparison.OrdinalIgnoreCase);
        }
    }

    public class ReportMissingItemRequest
    {
        public string ItemName { get; set; } = string.Empty;
        public string LastSeenBuilding { get; set; } = string.Empty;
        public string? LastSeenRoom { get; set; }
        public string ClaimerName { get; set; } = string.Empty;
        public string ClaimerEmail { get; set; } = string.Empty;
        public DateTime ClaimDate { get; set; }
    }
}
