using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueSubscriptionNameIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UQ_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7757));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7767));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7770));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7772));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7773));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7774));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7776));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7777));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7814));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7815));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7816));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7817));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7819));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7820));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7821));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7845));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7846));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7847));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7849));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7850));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7851));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7856));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7857));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7858));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7860));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7861));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7862));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7866));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7867));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7868));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7870));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7873));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7874));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7876));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7877));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7903));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7904));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7906));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7907));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7913));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 981, DateTimeKind.Utc).AddTicks(7915));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5376));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5383));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5384));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5385));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5386));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5388));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5389));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5390));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5390));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5391));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5392));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5393));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5394));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5395));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5396));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5397));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5398));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5399));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5400));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5401));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5402));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5403));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5404));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5405));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5406));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5408));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5409));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5410));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5411));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5412));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5413));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5414));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5415));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5416));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5417));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5418));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5419));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5420));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 25, 28, 982, DateTimeKind.Utc).AddTicks(5421));

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId_Name_Active",
                table: "UserSubscriptions",
                columns: new[] { "UserId", "Name" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSubscriptions_UserId_Name_Active",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7917));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7927));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7929));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7931));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7932));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7933));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7935));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7936));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7938));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7939));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7940));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7941));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7942));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7943));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7945));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7967));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7968));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7970));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7971));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7972));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7973));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7978));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7979));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(7980));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8016));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8018));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8019));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8023));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8024));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8026));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8028));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8031));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8032));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8033));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8034));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8036));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8037));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8038));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8039));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8044));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 480, DateTimeKind.Utc).AddTicks(8045));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5375));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5382));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5383));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5384));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5386));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5387));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5388));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5389));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5390));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5391));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5392));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5393));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5394));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5395));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5396));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5396));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5397));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5398));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5399));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5400));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5401));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5402));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5404));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5404));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5406));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5407));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5408));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5409));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5410));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5411));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5412));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5413));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5414));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5415));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5416));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5417));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5418));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5419));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 41, 481, DateTimeKind.Utc).AddTicks(5420));

            migrationBuilder.CreateIndex(
                name: "UQ_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions",
                columns: new[] { "UserId", "Name" },
                unique: true);
        }
    }
}
