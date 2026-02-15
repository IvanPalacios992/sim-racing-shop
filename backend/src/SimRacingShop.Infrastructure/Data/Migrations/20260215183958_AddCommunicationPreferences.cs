using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimRacingShop.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunicationPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCommunicationPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Newsletter = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    OrderNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SmsPromotions = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCommunicationPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCommunicationPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCommunicationPreferences_UserId",
                table: "UserCommunicationPreferences",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCommunicationPreferences");
        }
    }
}
