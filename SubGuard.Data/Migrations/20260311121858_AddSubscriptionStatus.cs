using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledDate",
                table: "UserSubscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PausedDate",
                table: "UserSubscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "UserSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Mevcut kayıtları IsActive değerine göre doğru Status değeriyle güncelle
            migrationBuilder.Sql(@"
                UPDATE ""UserSubscriptions""
                SET ""Status"" = CASE WHEN ""IsActive"" = true THEN 1 ELSE 3 END;
            ");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelledDate",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "PausedDate",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3000));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3007));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3009));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3010));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3011));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3012));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3013));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3014));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3015));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3039));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3040));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3041));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3041));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3045));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3046));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3047));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3048));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3052));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3053));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3054));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3057));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3058));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 375, DateTimeKind.Utc).AddTicks(3059));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(729));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(736));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(738));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(739));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(740));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(741));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(742));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(743));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(744));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 12, 10, 45, 376, DateTimeKind.Utc).AddTicks(745));
        }
    }
}
