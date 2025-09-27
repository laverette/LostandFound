using System.ComponentModel.DataAnnotations;

namespace LostAndFoundAPI.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public UserType UserType { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<FoundItem> FoundItems { get; set; } = new List<FoundItem>();
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<Claim> ResolvedClaims { get; set; } = new List<Claim>();
    }

    public enum UserType
    {
        Student,
        Admin
    }
}
