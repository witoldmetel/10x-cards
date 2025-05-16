using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenXCards.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixColumnNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MasteryLevel",
                table: "collections",
                newName: "mastery_level");

            migrationBuilder.RenameColumn(
                name: "LastStudied",
                table: "collections",
                newName: "last_studied");

            migrationBuilder.AlterColumn<double>(
                name: "mastery_level",
                table: "collections",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double precision");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "mastery_level",
                table: "collections",
                newName: "MasteryLevel");

            migrationBuilder.RenameColumn(
                name: "last_studied",
                table: "collections",
                newName: "LastStudied");

            migrationBuilder.AlterColumn<double>(
                name: "MasteryLevel",
                table: "collections",
                type: "double precision",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldDefaultValue: 0.0);
        }
    }
}
