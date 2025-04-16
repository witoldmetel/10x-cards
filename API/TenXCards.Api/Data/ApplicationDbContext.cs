using Microsoft.EntityFrameworkCore;
using TenXCards.Api.Models;

namespace TenXCards.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Flashcard> Flashcards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Flashcard>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Answer).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.ReviewStatus)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasConversion<string>();
                entity.Property(e => e.Archived).HasDefaultValue(false);
                entity.Property(e => e.Sm2Repetitions).HasDefaultValue(0);
                entity.Property(e => e.Sm2Interval).HasDefaultValue(0);
                entity.Property(e => e.Sm2Efactor).HasDefaultValue(2.5m);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");
            });
        }
    }
} 