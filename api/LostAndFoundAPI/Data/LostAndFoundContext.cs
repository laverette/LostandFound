using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Models;

namespace LostAndFoundAPI.Data
{
    public class LostAndFoundContext : DbContext
    {
        public LostAndFoundContext(DbContextOptions<LostAndFoundContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<FoundItem> FoundItems { get; set; }
        public DbSet<Claim> Claims { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User relationships
            modelBuilder.Entity<User>()
                .HasMany(u => u.FoundItems)
                .WithOne(f => f.AddedByUser)
                .HasForeignKey(f => f.AddedBy)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Claims)
                .WithOne(c => c.ClaimedByUser)
                .HasForeignKey(c => c.ClaimedBy)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasMany(u => u.ResolvedClaims)
                .WithOne(c => c.ResolvedByUser)
                .HasForeignKey(c => c.ResolvedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure FoundItem relationships
            modelBuilder.Entity<FoundItem>()
                .HasMany(f => f.Claims)
                .WithOne(c => c.Item)
                .HasForeignKey(c => c.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure soft delete for Claims
            modelBuilder.Entity<Claim>()
                .HasQueryFilter(c => c.DeletedAt == null);

            // Configure indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Claim>()
                .HasIndex(c => c.ItemId);

            modelBuilder.Entity<Claim>()
                .HasIndex(c => c.Status);
        }
    }
}
