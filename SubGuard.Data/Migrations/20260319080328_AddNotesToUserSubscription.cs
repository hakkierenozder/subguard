using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesToUserSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "UserSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(269));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(277));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(279));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(281));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(282));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(283));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(284));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(286));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(324));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(325));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(326));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(327));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(329));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(330));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(331));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(352));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(354));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(355));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(356));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(357));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(359));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(363));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(365));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(366));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(367));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(369));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(370));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(374));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(375));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(377));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(378));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(381));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(382));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(383));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(384));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(437));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(438));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(439));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(440));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(446));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(447));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7502));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7508));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7553));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7555));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7556));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7557));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7558));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7559));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7561));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7562));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7563));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7564));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7565));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7566));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7567));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7568));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7568));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7569));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7570));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7571));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7572));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7573));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7574));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7575));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7576));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7577));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7578));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7579));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7580));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7581));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7582));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7584));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7585));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7586));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7587));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7588));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7589));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7590));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7591));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2875));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2887));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2890));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2892));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2893));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2896));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2897));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2898));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2900));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2901));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2902));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2907));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2908));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2909));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2911));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2937));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2983));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2986));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2987));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2989));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2990));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(2998));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3000));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3001));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3004));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3005));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3007));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3012));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3014));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3016));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3017));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3022));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3023));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3025));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3026));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3027));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3029));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3030));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3032));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3038));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 497, DateTimeKind.Utc).AddTicks(3039));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3663));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3670));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3671));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3673));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3674));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3675));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3677));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3678));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3679));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3680));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3681));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3682));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3684));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3685));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3686));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3687));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3688));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3689));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3690));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3691));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3692));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3753));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3754));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3755));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3756));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3758));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3759));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3760));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3761));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3762));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3763));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3764));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3765));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3766));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3768));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3769));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3772));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3775));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 18, 23, 1, 33, 498, DateTimeKind.Utc).AddTicks(3776));
        }
    }
}
