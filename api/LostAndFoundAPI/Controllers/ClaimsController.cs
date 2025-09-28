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
        public async Task<ActionResult<IEnumerable<ClaimDto>>> GetClaims()
        {
            try
            {
                Console.WriteLine("Getting claims...");
                
                var claims = await _context.Claims
                    .Where(c => c.DeletedAt == null)
                    .OrderByDescending(c => c.DateSubmitted)
                    .ToListAsync();
                
                Console.WriteLine($"Found {claims.Count} claims");
                
                // Debug: Check what items exist
                var allItems = await _context.FoundItems.ToListAsync();
                Console.WriteLine($"Total items in database: {allItems.Count}");
                foreach (var item in allItems)
                {
                    Console.WriteLine($"Item: {item.Id} - {item.Name}");
                }
                
                var claimDtos = new List<ClaimDto>();
                
                foreach (var claim in claims)
                {
                    Console.WriteLine($"Looking for item with ID: {claim.ItemId}");
                    var item = await _context.FoundItems.FindAsync(claim.ItemId);
                    Console.WriteLine($"Found item: {item?.Name ?? "NULL"}");
                    
                    claimDtos.Add(new ClaimDto
                    {
                        Id = claim.Id,
                        ItemId = claim.ItemId,
                        ItemName = item?.Name ?? "Unknown Item",
                        ItemDescription = item?.Description ?? "",
                        ItemBuilding = item?.Building ?? "",
                        ItemRoom = item?.Room,
                        ClaimerName = claim.ClaimerName,
                        ClaimerEmail = claim.ClaimerEmail,
                        LastSeenBuilding = claim.LastSeenBuilding,
                        LastSeenRoom = claim.LastSeenRoom,
                        OwnershipDetails = claim.OwnershipDetails,
                        ClaimDate = claim.ClaimDate,
                        DateSubmitted = claim.DateSubmitted,
                        ClaimedBy = claim.ClaimedBy,
                        Status = claim.Status,
                        ResolvedDate = claim.ResolvedDate,
                        ResolvedBy = claim.ResolvedBy,
                        CreatedAt = claim.CreatedAt,
                        UpdatedAt = claim.UpdatedAt
                    });
                }
                
                return claimDtos;
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
        public async Task<ActionResult<IEnumerable<ClaimDto>>> GetPendingClaims()
        {
            try
            {
                Console.WriteLine("Getting pending claims...");
                var claims = await _context.Claims
                    .Where(c => c.Status == ClaimStatus.Pending && c.DeletedAt == null)
                    .OrderByDescending(c => c.DateSubmitted)
                    .ToListAsync();
                
                Console.WriteLine($"Found {claims.Count} pending claims");
                
                var claimDtos = new List<ClaimDto>();
                
                foreach (var claim in claims)
                {
                    Console.WriteLine($"Looking for item with ID: {claim.ItemId}");
                    var item = await _context.FoundItems.FindAsync(claim.ItemId);
                    Console.WriteLine($"Found item: {item?.Name ?? "NULL"}");
                    
                    claimDtos.Add(new ClaimDto
                    {
                        Id = claim.Id,
                        ItemId = claim.ItemId,
                        ItemName = item?.Name ?? "Unknown Item",
                        ItemDescription = item?.Description ?? "",
                        ItemBuilding = item?.Building ?? "",
                        ItemRoom = item?.Room,
                        ClaimerName = claim.ClaimerName,
                        ClaimerEmail = claim.ClaimerEmail,
                        LastSeenBuilding = claim.LastSeenBuilding,
                        LastSeenRoom = claim.LastSeenRoom,
                        OwnershipDetails = claim.OwnershipDetails,
                        ClaimDate = claim.ClaimDate,
                        DateSubmitted = claim.DateSubmitted,
                        ClaimedBy = claim.ClaimedBy,
                        Status = claim.Status,
                        ResolvedDate = claim.ResolvedDate,
                        ResolvedBy = claim.ResolvedBy,
                        CreatedAt = claim.CreatedAt,
                        UpdatedAt = claim.UpdatedAt
                    });
                }
                
                return claimDtos;
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
        public async Task<ActionResult<ClaimDto>> GetClaim(string id)
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

            var claimDto = new ClaimDto
            {
                Id = claim.Id,
                ItemId = claim.ItemId,
                ItemName = claim.Item?.Name ?? "Unknown Item",
                ItemDescription = claim.Item?.Description ?? "",
                ItemBuilding = claim.Item?.Building ?? "",
                ItemRoom = claim.Item?.Room,
                ClaimerName = claim.ClaimerName,
                ClaimerEmail = claim.ClaimerEmail,
                LastSeenBuilding = claim.LastSeenBuilding,
                LastSeenRoom = claim.LastSeenRoom,
                OwnershipDetails = claim.OwnershipDetails,
                ClaimDate = claim.ClaimDate,
                DateSubmitted = claim.DateSubmitted,
                ClaimedBy = claim.ClaimedBy,
                Status = claim.Status,
                ResolvedDate = claim.ResolvedDate,
                ResolvedBy = claim.ResolvedBy,
                CreatedAt = claim.CreatedAt,
                UpdatedAt = claim.UpdatedAt
            };

            return claimDto;
        }

        // POST: api/claims
        [HttpPost]
        public async Task<ActionResult<ClaimDto>> PostClaim(CreateClaimRequest request)
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

            // Return a DTO to avoid circular reference
            var claimDto = new ClaimDto
            {
                Id = claim.Id,
                ItemId = claim.ItemId,
                ItemName = item.Name,
                ItemDescription = item.Description,
                ItemBuilding = item.Building,
                ItemRoom = item.Room,
                ClaimerName = claim.ClaimerName,
                ClaimerEmail = claim.ClaimerEmail,
                LastSeenBuilding = claim.LastSeenBuilding,
                LastSeenRoom = claim.LastSeenRoom,
                OwnershipDetails = claim.OwnershipDetails,
                ClaimDate = claim.ClaimDate,
                DateSubmitted = claim.DateSubmitted,
                ClaimedBy = claim.ClaimedBy,
                Status = claim.Status,
                ResolvedDate = claim.ResolvedDate,
                ResolvedBy = claim.ResolvedBy,
                CreatedAt = claim.CreatedAt,
                UpdatedAt = claim.UpdatedAt
            };

            return CreatedAtAction("GetClaim", new { id = claim.Id }, claimDto);
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
