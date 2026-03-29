using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionAndRefreshTokenIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "UserSubscriptions",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9350));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9363));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9365));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9367));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9368));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9369));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9370));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9371));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9417));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9418));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9419));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9421));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9422));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9423));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9424));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9448));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9449));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9450));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9452));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9454));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9456));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9460));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9462));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9463));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9465));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9466));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9467));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9471));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9473));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9475));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9476));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9480));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9481));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9482));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9484));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9515));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9517));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9518));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9519));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9524));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 962, DateTimeKind.Utc).AddTicks(9525));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6869));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6925));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6926));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6928));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6929));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6930));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6931));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6932));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6933));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6934));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6935));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6936));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6937));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6938));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6939));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6940));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6941));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6942));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6943));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6944));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6945));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6946));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6947));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6948));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6949));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6950));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6951));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6952));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6953));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6954));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6955));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6956));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6957));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6958));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6959));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6960));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6960));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6962));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 15, 7, 34, 963, DateTimeKind.Utc).AddTicks(6963));

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Expiration",
                table: "RefreshTokens",
                column: "Expiration");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_Expiration",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "RowVersion",
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
        }
    }
}
