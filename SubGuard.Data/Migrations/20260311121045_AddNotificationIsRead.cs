using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationIsRead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "NotificationQueues",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadDate",
                table: "NotificationQueues",
                type: "timestamp with time zone",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "NotificationQueues");

            migrationBuilder.DropColumn(
                name: "ReadDate",
                table: "NotificationQueues");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3631));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3636));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3638));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3639));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3640));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3641));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3642));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3643));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3644));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3704));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3705));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3706));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3707));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3711));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3712));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3713));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3714));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3718));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3719));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3720));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3723));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3724));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3725));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(571));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(578));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(628));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(629));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(630));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(631));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(632));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(634));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(635));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(636));
        }
    }
}
