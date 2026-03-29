using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSharedUserEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceHistories_UserSubscriptions_SubscriptionId",
                table: "PriceHistories");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "UserSubscriptions",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SharedUserEmail",
                table: "SubscriptionShares",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8604));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8613));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8615));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8617));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8618));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8619));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8620));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8621));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8623));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8624));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8625));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8626));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8669));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8671));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8672));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8690));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8691));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8692));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8693));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8694));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8696));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8699));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8700));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8701));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8703));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8705));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8706));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8710));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8712));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8713));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8714));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8717));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8718));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8719));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8720));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8722));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8723));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8724));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8726));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8766));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 725, DateTimeKind.Utc).AddTicks(8767));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6546));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6559));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6561));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6562));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6563));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6564));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6641));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6642));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6643));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6645));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6646));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6647));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6648));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6650));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6651));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6652));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6653));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6654));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6656));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6657));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6658));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6659));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6661));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6662));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6663));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6664));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6666));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6667));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6668));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6669));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6670));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6672));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6673));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6674));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6675));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6676));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6678));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6679));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 29, 11, 9, 30, 726, DateTimeKind.Utc).AddTicks(6680));

            migrationBuilder.AddForeignKey(
                name: "FK_PriceHistories_UserSubscriptions_SubscriptionId",
                table: "PriceHistories",
                column: "SubscriptionId",
                principalTable: "UserSubscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceHistories_UserSubscriptions_SubscriptionId",
                table: "PriceHistories");

            migrationBuilder.DropColumn(
                name: "SharedUserEmail",
                table: "SubscriptionShares");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "UserSubscriptions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3033));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3043));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3045));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3046));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3047));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3048));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3082));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3083));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3084));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3085));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3086));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3088));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3089));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3090));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3091));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3111));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3112));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3113));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3114));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3115));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3117));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3122));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3124));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3126));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3128));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3129));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3131));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3135));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3137));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3139));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3140));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3142));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3147));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3171));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3173));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3174));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3175));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3176));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3177));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3183));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(3184));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9755));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9762));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9764));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9765));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9766));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9767));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9768));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9769));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9770));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9771));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9772));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9773));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9774));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9775));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9776));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9777));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9778));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9779));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9780));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9781));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9782));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9783));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9784));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9785));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9786));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9787));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9787));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9788));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9789));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9790));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9792));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9792));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9793));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9794));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9795));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9796));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9797));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9798));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 28, 16, 20, 12, 687, DateTimeKind.Utc).AddTicks(9799));

            migrationBuilder.AddForeignKey(
                name: "FK_PriceHistories_UserSubscriptions_SubscriptionId",
                table: "PriceHistories",
                column: "SubscriptionId",
                principalTable: "UserSubscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
