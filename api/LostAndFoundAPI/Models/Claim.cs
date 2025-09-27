using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LostAndFoundAPI.Models
{
    public class Claim
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("Item")]
        public string ItemId { get; set; } = string.Empty;
        
        public FoundItem? Item { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ClaimerName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string ClaimerEmail { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastSeenBuilding { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? LastSeenRoom { get; set; }
        
        [Required]
        public string OwnershipDetails { get; set; } = string.Empty;
        
        [Required]
        public DateTime ClaimDate { get; set; }
        
        public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ClaimedBy")]
        public string? ClaimedBy { get; set; } = string.Empty;
        
        public User? ClaimedByUser { get; set; }
        
        [Required]
        public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
        
        public DateTime? ResolvedDate { get; set; }
        
        [ForeignKey("ResolvedBy")]
        public string? ResolvedBy { get; set; }
        
        public User? ResolvedByUser { get; set; }
        
        // Soft delete
        public DateTime? DeletedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum ClaimStatus
    {
        Pending,
        Resolved
    }
}
