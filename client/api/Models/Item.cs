namespace api.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string? Room { get; set; }
        public DateTime DateFound { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? FoundByUserId { get; set; }
        public bool IsClaimed { get; set; }
        public int? ClaimedByUserId { get; set; }
        public DateTime? ClaimedAt { get; set; }
    }
}

namespace api.Models
{
    public class MissingItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string? Room { get; set; }
        public DateTime? DateLost { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ReportedByUserId { get; set; }
        public bool IsFound { get; set; }
        public int? FoundItemId { get; set; }
    }
}

