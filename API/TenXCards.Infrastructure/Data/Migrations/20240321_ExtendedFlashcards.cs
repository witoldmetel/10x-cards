using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace TenXCards.Infrastructure.Data.Migrations
{
    public partial class ExtendedFlashcards : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "flashcards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Front = table.Column<string>(type: "text", nullable: false),
                    Back = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreationSource = table.Column<string>(type: "varchar(50)", nullable: false),
                    ReviewStatus = table.Column<string>(type: "varchar(50)", nullable: false),
                    Tags = table.Column<string[]>(type: "text[]", nullable: true),
                    Category = table.Column<string[]>(type: "text[]", nullable: true),
                    Sm2Repetitions = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Sm2Interval = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Sm2Efactor = table.Column<double>(type: "double precision", nullable: false, defaultValue: 2.5),
                    Sm2DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_flashcards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_flashcards_IsArchived",
                table: "flashcards",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_flashcards_ReviewStatus",
                table: "flashcards",
                column: "ReviewStatus");

            migrationBuilder.CreateIndex(
                name: "IX_flashcards_Sm2DueDate",
                table: "flashcards",
                column: "Sm2DueDate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "flashcards");
        }
    }
} 