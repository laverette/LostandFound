using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LostAndFoundAPI.Models
{
    public class FoundItem
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Building { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? Room { get; set; }
        
        [Required]
        public DateTime DateFound { get; set; }
        
        [ForeignKey("AddedBy")]
        public string? AddedBy { get; set; } = string.Empty;
        
        public User? AddedByUser { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    }
}
