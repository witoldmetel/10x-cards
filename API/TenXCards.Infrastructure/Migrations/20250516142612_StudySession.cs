using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenXCards.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StudySession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "best_streak",
                table: "collections",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "current_streak",
                table: "collections",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "best_streak",
                table: "collections");

            migrationBuilder.DropColumn(
                name: "current_streak",
                table: "collections");
        }
    }
}
