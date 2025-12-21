using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedMonthlyBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyBudget",
                table: "AspNetUsers",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyBudget",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(859));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(863));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(865));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(866));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(867));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(868));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(868));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(869));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(870));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(889));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(890));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(926));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(928));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(931));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(932));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(933));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(934));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(938));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(939));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(940));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(943));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(944));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(945));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4247));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4253));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4255));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4256));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4257));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4258));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4259));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4260));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4261));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4262));
        }
    }
}
