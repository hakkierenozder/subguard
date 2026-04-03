using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestShareSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SharedUserId",
                table: "SubscriptionShares",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "SubscriptionShares",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1330));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1340));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1342));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1344));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1346));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1347));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1348));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1349));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1350));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1351));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1352));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1354));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1355));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1356));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1357));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1437));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1439));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1440));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1442));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1443));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1444));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1448));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1450));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1453));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1455));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1457));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1458));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1462));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1464));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1466));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1467));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1470));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1472));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1474));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1475));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1476));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1477));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1478));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1479));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1483));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(1485));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8009));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8021));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8022));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8023));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8024));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8026));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8026));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8028));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8029));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8030));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8031));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8032));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8066));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8068));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8069));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8070));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8071));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8072));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8073));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8074));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8075));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8076));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8077));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8078));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8079));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8080));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8081));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8082));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8083));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8084));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8085));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8086));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8087));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8088));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8089));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8090));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8091));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8092));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 19, 31, 42, 536, DateTimeKind.Utc).AddTicks(8093));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "SubscriptionShares");

            migrationBuilder.AlterColumn<string>(
                name: "SharedUserId",
                table: "SubscriptionShares",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6738));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6748));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6750));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6751));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6753));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6754));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6755));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6756));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6757));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6759));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6760));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6763));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6764));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6765));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6766));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6791));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6793));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6794));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6795));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6796));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6797));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6831));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6832));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6833));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6834));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6835));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6836));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6840));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6843));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6845));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6846));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6849));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6850));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6851));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6853));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6854));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6855));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6856));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6858));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6862));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 3, DateTimeKind.Utc).AddTicks(6863));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4725));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4734));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4735));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4737));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4738));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4739));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4740));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4741));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4742));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4743));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4744));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4745));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4746));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4747));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4748));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4749));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4750));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4751));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4753));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4753));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4754));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4755));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4756));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4757));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4759));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4760));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4761));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4762));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4763));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4764));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4765));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4766));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4801));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4802));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4803));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4804));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4805));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4806));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 41, 12, 4, DateTimeKind.Utc).AddTicks(4807));
        }
    }
}
