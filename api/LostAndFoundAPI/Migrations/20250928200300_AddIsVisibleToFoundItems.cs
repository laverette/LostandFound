using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LostAndFoundAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIsVisibleToFoundItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVisible",
                table: "FoundItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVisible",
                table: "FoundItems");
        }
    }
}
