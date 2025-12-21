using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveProp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "UserSubscriptions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(949));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(953));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(954));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(956));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(957));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(957));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(958));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(959));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(960));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(979));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(980));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(981));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(982));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(985));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(986));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(987));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(988));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(992));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(993));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(994));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(997));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(998));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(999));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4288));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4295));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4297));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4298));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4299));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4301));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4302));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4303));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4304));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4305));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7923));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7972));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7973));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7974));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7975));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7979));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7980));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7981));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(7982));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8008));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8009));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8010));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8011));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8014));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8015));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8016));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8017));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8022));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8023));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8024));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8027));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8028));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 223, DateTimeKind.Utc).AddTicks(8028));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1273));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1282));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1283));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1284));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1285));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1287));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1287));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1289));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1290));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 8, 49, 15, 224, DateTimeKind.Utc).AddTicks(1291));
        }
    }
}
