namespace LostAndFoundAPI.Models
{
    public class ClaimDto
    {
        public string Id { get; set; } = string.Empty;
        public string ItemId { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemDescription { get; set; } = string.Empty;
        public string ItemBuilding { get; set; } = string.Empty;
        public string? ItemRoom { get; set; }
        public string ClaimerName { get; set; } = string.Empty;
        public string ClaimerEmail { get; set; } = string.Empty;
        public string LastSeenBuilding { get; set; } = string.Empty;
        public string? LastSeenRoom { get; set; }
        public string OwnershipDetails { get; set; } = string.Empty;
        public DateTime ClaimDate { get; set; }
        public DateTime DateSubmitted { get; set; }
        public string? ClaimedBy { get; set; }
        public ClaimStatus Status { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? ResolvedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
