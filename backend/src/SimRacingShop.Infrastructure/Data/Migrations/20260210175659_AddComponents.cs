using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimRacingShop.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddComponents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Components",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Sku = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ComponentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StockQuantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    MinStockThreshold = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    WeightGrams = table.Column<int>(type: "integer", nullable: true),
                    CostPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Components", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ComponentTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Locale = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComponentTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComponentTranslations_Components_ComponentId",
                        column: x => x.ComponentId,
                        principalTable: "Components",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductComponentOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentId = table.Column<Guid>(type: "uuid", nullable: false),
                    OptionGroup = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PriceModifier = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0.00m),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductComponentOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductComponentOptions_Components_ComponentId",
                        column: x => x.ComponentId,
                        principalTable: "Components",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductComponentOptions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Components_ComponentType",
                table: "Components",
                column: "ComponentType");

            migrationBuilder.CreateIndex(
                name: "IX_Components_ComponentType_StockQuantity",
                table: "Components",
                columns: new[] { "ComponentType", "StockQuantity" });

            migrationBuilder.CreateIndex(
                name: "IX_Components_Sku",
                table: "Components",
                column: "Sku",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Components_StockQuantity",
                table: "Components",
                column: "StockQuantity");

            migrationBuilder.CreateIndex(
                name: "IX_ComponentTranslations_ComponentId_Locale",
                table: "ComponentTranslations",
                columns: new[] { "ComponentId", "Locale" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductComponentOptions_ComponentId",
                table: "ProductComponentOptions",
                column: "ComponentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductComponentOptions_OptionGroup",
                table: "ProductComponentOptions",
                column: "OptionGroup");

            migrationBuilder.CreateIndex(
                name: "IX_ProductComponentOptions_ProductId",
                table: "ProductComponentOptions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductComponentOptions_ProductId_ComponentId",
                table: "ProductComponentOptions",
                columns: new[] { "ProductId", "ComponentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComponentTranslations");

            migrationBuilder.DropTable(
                name: "ProductComponentOptions");

            migrationBuilder.DropTable(
                name: "Components");
        }
    }
}
