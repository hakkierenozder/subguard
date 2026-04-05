using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AllowDuplicateSubscriptionNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSubscriptions_UserId_Name_Active",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5562));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5573));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5624));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5626));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5627));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5629));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5632));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5633));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5634));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5635));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5636));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5637));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5639));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5640));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5641));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5663));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5664));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5665));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5668));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5670));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5672));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5677));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5678));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5679));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5680));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5681));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5683));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5686));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5688));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5689));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5727));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5731));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5732));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5733));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5735));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5736));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5737));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5738));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5739));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5744));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 138, DateTimeKind.Utc).AddTicks(5746));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3022));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3030));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3032));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3033));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3034));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3035));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3036));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3037));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3038));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3039));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3040));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3041));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3042));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3043));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3044));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3045));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3046));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3047));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3048));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3049));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3050));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3051));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3052));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3053));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3054));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3056));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3057));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3058));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3059));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3060));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3061));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3062));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3063));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3064));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3065));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3066));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3067));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3068));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 6, 44, 49, 139, DateTimeKind.Utc).AddTicks(3069));

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions",
                columns: new[] { "UserId", "Name" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions");

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

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId_Name_Active",
                table: "UserSubscriptions",
                columns: new[] { "UserId", "Name" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }
    }
}
