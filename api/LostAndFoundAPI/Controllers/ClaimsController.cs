using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;
using LostAndFoundAPI.Models;

namespace LostAndFoundAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClaimsController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public ClaimsController(LostAndFoundContext context)
        {
            _context = context;
        }

        // GET: api/claims
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Claim>>> GetClaims()
        {
            try
            {
                Console.WriteLine("Getting claims...");
                
                // First try without includes to see if that's the issue
                var claims = await _context.Claims
                    .OrderByDescending(c => c.DateSubmitted)
                    .ToListAsync();
                
                Console.WriteLine($"Found {claims.Count} claims");
                
                // Now try to load the related items separately
                foreach (var claim in claims)
                {
                    if (!string.IsNullOrEmpty(claim.ItemId))
                    {
                        claim.Item = await _context.FoundItems.FindAsync(claim.ItemId);
                    }
                }
                
                return claims;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting claims: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/claims/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Claim>>> GetPendingClaims()
        {
            try
            {
                Console.WriteLine("Getting pending claims...");
                var claims = await _context.Claims
                    .Where(c => c.Status == ClaimStatus.Pending)
                    .OrderByDescending(c => c.DateSubmitted)
                    .ToListAsync();
                
                Console.WriteLine($"Found {claims.Count} pending claims");
                
                // Load related items separately
                foreach (var claim in claims)
                {
                    if (!string.IsNullOrEmpty(claim.ItemId))
                    {
                        claim.Item = await _context.FoundItems.FindAsync(claim.ItemId);
                    }
                }
                
                return claims;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting pending claims: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/claims/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Claim>> GetClaim(string id)
        {
            var claim = await _context.Claims
                .Include(c => c.Item)
                .Include(c => c.ClaimedByUser)
                .Include(c => c.ResolvedByUser)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (claim == null)
            {
                return NotFound();
            }

            return claim;
        }

        // POST: api/claims
        [HttpPost]
        public async Task<ActionResult<Claim>> PostClaim(CreateClaimRequest request)
        {
            // Verify the item exists
            var item = await _context.FoundItems.FindAsync(request.ItemId);
            if (item == null)
            {
                return BadRequest("Item not found");
            }

            // Log the user ID - we'll allow claims even if user doesn't exist
            Console.WriteLine($"Creating claim for user ID: {request.ClaimedBy}");

            var claim = new Claim
            {
                Id = Guid.NewGuid().ToString(),
                ItemId = request.ItemId,
                ClaimerName = request.ClaimerName,
                ClaimerEmail = request.ClaimerEmail,
                LastSeenBuilding = request.LastSeenBuilding,
                LastSeenRoom = request.LastSeenRoom,
                OwnershipDetails = request.OwnershipDetails,
                ClaimDate = request.ClaimDate,
                DateSubmitted = DateTime.UtcNow,
                ClaimedBy = request.ClaimedBy,
                Status = ClaimStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Claims.Add(claim);
            await _context.SaveChangesAsync();

            // Return the claim with related data
            return CreatedAtAction("GetClaim", new { id = claim.Id }, await GetClaimWithIncludes(claim.Id));
        }

        // PUT: api/claims/5/resolve
        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> ResolveClaim(string id, ResolveClaimRequest request)
        {
            var claim = await _context.Claims.FindAsync(id);
            if (claim == null)
            {
                return NotFound();
            }

            // Log the resolver user ID
            Console.WriteLine($"Resolving claim by user ID: {request.ResolvedBy}");

            claim.Status = ClaimStatus.Resolved;
            claim.ResolvedDate = DateTime.UtcNow;
            claim.ResolvedBy = request.ResolvedBy;
            claim.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/claims/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClaim(string id)
        {
            var claim = await _context.Claims.FindAsync(id);
            if (claim == null)
            {
                return NotFound();
            }

            // Soft delete
            claim.DeletedAt = DateTime.UtcNow;
            claim.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<Claim?> GetClaimWithIncludes(string id)
        {
            return await _context.Claims
                .Include(c => c.Item)
                .Include(c => c.ClaimedByUser)
                .Include(c => c.ResolvedByUser)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }

    // Request DTOs
    public class CreateClaimRequest
    {
        public string ItemId { get; set; } = string.Empty;
        public string ClaimerName { get; set; } = string.Empty;
        public string ClaimerEmail { get; set; } = string.Empty;
        public string LastSeenBuilding { get; set; } = string.Empty;
        public string? LastSeenRoom { get; set; }
        public string OwnershipDetails { get; set; } = string.Empty;
        public DateTime ClaimDate { get; set; }
        public string ClaimedBy { get; set; } = string.Empty;
    }

    public class ResolveClaimRequest
    {
        public string ResolvedBy { get; set; } = string.Empty;
    }
}
