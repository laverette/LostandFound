namespace LostAndFoundAPI.Models
{
    public class FoundItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string? Room { get; set; }
        public DateTime DateFound { get; set; }
        public string? AddedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
