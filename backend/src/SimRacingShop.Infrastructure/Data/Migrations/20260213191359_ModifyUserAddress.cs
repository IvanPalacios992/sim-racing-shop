using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimRacingShop.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ModifyUserAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AddressType_New",
                table: "UserAddresses",
                nullable: false,
                defaultValue: 0);

            // Mapea los valores
            migrationBuilder.Sql(@"
                UPDATE ""UserAddresses""
                SET ""AddressType_New"" = CASE 
                    WHEN ""AddressType"" = 'delivery' THEN 1
                    ELSE 0
                END");

            // Elimina la columna antigua
            migrationBuilder.DropColumn(
                name: "AddressType",
                table: "UserAddresses");

            // Renombra la nueva columna
            migrationBuilder.RenameColumn(
                name: "AddressType_New",
                table: "UserAddresses",
                newName: "AddressType");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "UserAddresses",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "UserAddresses");

            migrationBuilder.AlterColumn<string>(
                name: "AddressType",
                table: "UserAddresses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldMaxLength: 20);
        }
    }
}
