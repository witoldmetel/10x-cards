using Microsoft.EntityFrameworkCore;
using TenXCards.Api.Data.Models;

namespace TenXCards.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Card> Cards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Card>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired();
                entity.Property(e => e.Answer).IsRequired();
                entity.Property(e => e.ReviewStatus)
                    .IsRequired()
                    .HasConversion<string>();
                entity.Property(e => e.Archived).HasDefaultValue(false);
                entity.Property(e => e.Sm2Repetitions).HasDefaultValue(0);
                entity.Property(e => e.Sm2Interval).HasDefaultValue(0);
                entity.Property(e => e.Sm2Efactor).HasDefaultValue(2.5m);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });
        }
    }
} 