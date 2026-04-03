using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessUntilDateToSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AccessUntilDate",
                table: "UserSubscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6270));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6280));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6282));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6283));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6285));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6286));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6287));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6288));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6289));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6291));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6292));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6293));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6294));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6296));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6297));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6317));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6318));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6319));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6320));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6322));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6323));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6328));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6329));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6330));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6331));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6333));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6381));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6385));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6386));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6388));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6390));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6394));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6395));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6397));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6398));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6399));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6400));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6401));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6402));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6407));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 370, DateTimeKind.Utc).AddTicks(6408));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3572));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3580));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3581));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3582));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3583));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3584));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3585));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3586));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3587));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3588));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3589));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3590));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3591));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3592));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3593));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3594));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3595));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3596));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3597));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3598));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3599));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3600));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3601));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3602));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3603));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3604));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3605));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3606));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3607));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3608));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3608));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3609));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3610));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3611));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3612));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3613));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3614));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3615));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 15, 24, 26, 371, DateTimeKind.Utc).AddTicks(3616));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessUntilDate",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2840));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2851));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2853));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2855));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2856));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2857));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2859));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2860));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2916));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2918));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2919));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2920));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2921));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2922));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2923));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2943));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2944));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2945));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2946));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2947));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2949));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2954));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2956));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2958));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2960));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2961));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2962));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2967));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2968));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2969));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2970));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2973));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2976));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2977));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(2978));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3006));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3007));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3008));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3009));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3015));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 669, DateTimeKind.Utc).AddTicks(3017));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1123));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1134));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1136));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1137));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1138));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1139));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1140));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1141));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1142));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1143));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1144));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1145));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1146));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1147));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1148));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1149));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1150));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1151));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1152));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1153));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1154));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1155));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1156));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1157));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1158));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1159));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1160));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1161));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1162));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1163));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1163));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1164));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1165));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1166));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1167));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1168));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1169));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1170));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 3, 12, 3, 51, 670, DateTimeKind.Utc).AddTicks(1171));
        }
    }
}
