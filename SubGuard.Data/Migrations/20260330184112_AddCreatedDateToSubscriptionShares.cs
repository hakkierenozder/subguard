using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedDateToSubscriptionShares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""SubscriptionShares""
                ADD COLUMN IF NOT EXISTS ""CreatedDate"" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;
            ");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7356));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7366));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7408));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7409));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7414));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7416));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7418));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7420));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7421));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7422));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7423));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7425));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7426));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7427));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7428));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7446));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7447));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7448));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7449));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7450));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7452));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7456));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7457));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7458));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7459));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7460));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7461));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7465));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7466));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7493));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7495));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7499));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7500));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7501));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7503));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7505));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7506));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7507));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7508));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7513));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 327, DateTimeKind.Utc).AddTicks(7514));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5078));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5085));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5087));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5088));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5089));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5090));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5091));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5092));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5093));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5094));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5095));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5096));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5097));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5098));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5099));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5100));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5101));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5102));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5103));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5104));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5105));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5106));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5107));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5108));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5109));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5110));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5111));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5112));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5113));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5114));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5115));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5116));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5117));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5118));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5119));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5120));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5121));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5122));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 30, 18, 36, 44, 328, DateTimeKind.Utc).AddTicks(5123));
        }
    }
}
