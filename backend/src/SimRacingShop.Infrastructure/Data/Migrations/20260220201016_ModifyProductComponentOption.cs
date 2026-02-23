using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimRacingShop.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ModifyProductComponentOption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GlbObjectName",
                table: "ProductComponentOptions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGroupRequired",
                table: "ProductComponentOptions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "ProductComponentOptions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GlbObjectName",
                table: "ProductComponentOptions");

            migrationBuilder.DropColumn(
                name: "IsGroupRequired",
                table: "ProductComponentOptions");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "ProductComponentOptions");
        }
    }
}
