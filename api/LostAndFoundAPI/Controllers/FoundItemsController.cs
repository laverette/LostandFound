using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;
using LostAndFoundAPI.Models;

namespace LostAndFoundAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoundItemsController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public FoundItemsController(LostAndFoundContext context)
        {
            _context = context;
        }

        // GET: api/founditems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoundItemDto>>> GetFoundItems()
        {
            try
            {
                Console.WriteLine("Getting found items...");
                var items = await _context.FoundItems
                    .Where(f => f.IsVisible == true)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();
                Console.WriteLine($"Found {items.Count} items");
                
                var itemDtos = items.Select(item => new FoundItemDto
                {
                    Id = item.Id,
                    Name = item.Name,
                    Description = item.Description,
                    Building = item.Building,
                    Room = item.Room,
                    DateFound = item.DateFound,
                    AddedBy = item.AddedBy,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                }).ToList();
                
                return itemDtos;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting found items: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/founditems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FoundItem>> GetFoundItem(string id)
        {
            var foundItem = await _context.FoundItems
                .Include(f => f.AddedByUser)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (foundItem == null)
            {
                return NotFound();
            }

            return foundItem;
        }

        // POST: api/founditems
        [HttpPost]
        public async Task<ActionResult<FoundItem>> PostFoundItem(FoundItem foundItem)
        {
            try
            {
                // Log the incoming data
                Console.WriteLine($"Received found item: Name={foundItem.Name}, AddedBy={foundItem.AddedBy}");
                
                // Generate ID if not provided
                if (string.IsNullOrEmpty(foundItem.Id))
                {
                    foundItem.Id = Guid.NewGuid().ToString();
                }

                // For now, just log the user ID - we'll handle user creation separately
                Console.WriteLine($"Adding item for user ID: {foundItem.AddedBy}");

                foundItem.CreatedAt = DateTime.UtcNow;
                foundItem.UpdatedAt = DateTime.UtcNow;

                _context.FoundItems.Add(foundItem);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Successfully saved found item with ID: {foundItem.Id}");
                return CreatedAtAction("GetFoundItem", new { id = foundItem.Id }, foundItem);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving found item: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error saving item: {ex.Message}");
            }
        }

        // DELETE: api/founditems/5 (hard delete - removes item and all associated claims)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoundItem(string id)
        {
            var foundItem = await _context.FoundItems
                .Include(f => f.Claims)
                .FirstOrDefaultAsync(f => f.Id == id);
            
            if (foundItem == null)
            {
                return NotFound();
            }

            // Get count of claims before deletion for logging
            var claimCount = foundItem.Claims.Count;
            
            // Delete all associated claims first (to avoid foreign key constraint issues)
            _context.Claims.RemoveRange(foundItem.Claims);
            
            // Then delete the found item
            _context.FoundItems.Remove(foundItem);
            
            await _context.SaveChangesAsync();

            // Log the deletion
            Console.WriteLine($"DELETED: Item '{foundItem.Name}' (ID: {id}) and {claimCount} associated claims");

            return NoContent();
        }

        // PUT: api/founditems/5/hide
        [HttpPut("{id}/hide")]
        public async Task<IActionResult> HideFoundItem(string id)
        {
            var foundItem = await _context.FoundItems.FindAsync(id);
            if (foundItem == null)
            {
                return NotFound();
            }

            foundItem.IsVisible = false;
            foundItem.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FoundItemExists(string id)
        {
            return _context.FoundItems.Any(e => e.Id == id);
        }
    }
}
