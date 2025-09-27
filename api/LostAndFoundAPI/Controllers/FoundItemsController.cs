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
        public async Task<ActionResult<IEnumerable<FoundItem>>> GetFoundItems()
        {
            try
            {
                Console.WriteLine("Getting found items...");
                var items = await _context.FoundItems
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();
                Console.WriteLine($"Found {items.Count} items");
                return items;
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

        // DELETE: api/founditems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoundItem(string id)
        {
            var foundItem = await _context.FoundItems.FindAsync(id);
            if (foundItem == null)
            {
                return NotFound();
            }

            _context.FoundItems.Remove(foundItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FoundItemExists(string id)
        {
            return _context.FoundItems.Any(e => e.Id == id);
        }
    }
}
