using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingMonthAndNotifQueueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate",
                table: "NotificationQueues");

            migrationBuilder.AddColumn<int>(
                name: "BillingMonth",
                table: "UserSubscriptions",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1713));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1725));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1727));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1728));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1730));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1778));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1779));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1780));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1782));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1783));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1785));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1786));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1787));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1789));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1790));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1817));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1820));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1822));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1824));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1826));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1827));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1831));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1832));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1834));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1835));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1836));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1837));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1841));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1842));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1843));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1844));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1847));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1886));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1887));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1889));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1890));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1891));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1892));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1894));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1899));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(1900));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9319));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9329));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9330));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9331));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9332));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9333));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9334));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9336));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9337));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9338));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9339));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9340));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9341));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9342));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9343));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9344));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9345));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9346));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9347));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9348));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9349));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9350));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9351));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9352));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9353));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9354));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9355));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9356));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9357));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9358));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9359));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9360));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9361));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9362));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9363));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9364));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9365));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9366));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 19, 45, 3, 416, DateTimeKind.Utc).AddTicks(9367));

            migrationBuilder.CreateIndex(
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate_Type",
                table: "NotificationQueues",
                columns: new[] { "UserId", "UserSubscriptionId", "ScheduledDate", "Type" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate_Type",
                table: "NotificationQueues");

            migrationBuilder.DropColumn(
                name: "BillingMonth",
                table: "UserSubscriptions");

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
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate",
                table: "NotificationQueues",
                columns: new[] { "UserId", "UserSubscriptionId", "ScheduledDate" },
                unique: true);
        }
    }
}
