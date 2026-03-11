using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MonthlyBudgetCurrency",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2362));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2368));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2370));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2371));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2372));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2373));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2374));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2376));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2377));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2398));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2400));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2401));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2402));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2406));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2407));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2461));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2463));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2469));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2470));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2471));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2475));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2476));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(2477));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9415));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9422));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9423));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9424));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9425));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9426));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9427));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9428));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9429));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 24, 29, 638, DateTimeKind.Utc).AddTicks(9430));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyBudgetCurrency",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1352));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1358));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1359));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1360));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1361));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1363));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1364));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1365));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1366));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1388));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1388));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1389));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1390));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1394));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1395));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1396));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1396));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1429));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1431));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1432));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1435));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1436));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(1437));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7791));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7797));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7798));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7799));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7800));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7801));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7802));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7803));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7804));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 18, 58, 137, DateTimeKind.Utc).AddTicks(7805));
        }
    }
}
