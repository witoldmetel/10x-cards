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
        public DbSet<Collection> Collections { get; set; }
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
                
                entity.Property(e => e.ApiModelKey)
                    .HasColumnName("api_model_key")
                    .IsRequired(false);
                
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Collection>(entity =>
            {
                entity.ToTable("collections");

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .IsRequired();

                entity.Property(e => e.Name)
                    .HasColumnName("name")
                    .IsRequired();

                entity.Property(e => e.Description)
                    .HasColumnName("description");

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .IsRequired();

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at");

                entity.Property(e => e.ArchivedAt)
                    .HasColumnName("archived_at");

                entity.Property(e => e.TotalCards)
                    .HasColumnName("total_cards")
                    .HasDefaultValue(0);

                entity.Property(e => e.DueCards)
                    .HasColumnName("due_cards")
                    .HasDefaultValue(0);

                entity.Property(e => e.Color)
                    .HasColumnName("color")
                    .IsRequired();

                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(c => c.Flashcards)
                    .WithOne(f => f.Collection)
                    .HasForeignKey(f => f.CollectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Flashcard>(entity =>
            {
                entity.ToTable("flashcards");

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.CollectionId)
                    .HasColumnName("collection_id")
                    .IsRequired();

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .IsRequired();

                entity.Property(e => e.Front)
                    .HasColumnName("front")
                    .IsRequired();

                entity.Property(e => e.Back)
                    .HasColumnName("back")
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .IsRequired();

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at");

                entity.Property(e => e.ArchivedAt)
                    .HasColumnName("archived_at");

                entity.Property(e => e.CreationSource)
                    .HasColumnName("creation_source")
                    .HasConversion<string>()
                    .HasColumnType("varchar(50)")
                    .IsRequired();

                entity.Property(e => e.ReviewStatus)
                    .HasColumnName("review_status")
                    .HasConversion<string>()
                    .HasColumnType("varchar(50)")
                    .IsRequired();

                entity.Property(e => e.Tags)
                    .HasColumnName("tags")
                    .HasColumnType("text[]");

                entity.Property(e => e.Category)
                    .HasColumnName("category")
                    .HasColumnType("text[]");

                entity.Property(e => e.Sm2Repetitions)
                    .HasColumnName("sm2_repetitions")
                    .HasDefaultValue(0);

                entity.Property(e => e.Sm2Interval)
                    .HasColumnName("sm2_interval")
                    .HasDefaultValue(0);

                entity.Property(e => e.Sm2Efactor)
                    .HasColumnName("sm2_efactor")
                    .HasDefaultValue(2.5);

                entity.Property(e => e.Sm2DueDate)
                    .HasColumnName("sm2_due_date");

                entity.HasOne(f => f.User)
                    .WithMany()
                    .HasForeignKey(f => f.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.Collection)
                    .WithMany(c => c.Flashcards)
                    .HasForeignKey(f => f.CollectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
} 