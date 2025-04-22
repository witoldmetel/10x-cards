using Microsoft.EntityFrameworkCore;
using TenXCards.Core.Models;

namespace TenXCards.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Flashcard> Flashcards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                
                entity.Property(e => e.Email)
                    .HasColumnName("email")
                    .IsRequired();
                
                entity.HasIndex(e => e.Email)
                    .IsUnique();
                
                entity.Property(e => e.Password)
                    .HasColumnName("password")
                    .IsRequired();
                
                entity.Property(e => e.ApiKey)
                    .HasColumnName("api_key")
                    .IsRequired();
                
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Flashcard>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Front).IsRequired();
                entity.Property(e => e.Back).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.CreationSource).IsRequired();
            });
        }
    }
} 