using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddJsonFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SharedWithJson",
                table: "UserSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsageHistoryJson",
                table: "UserSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 230, DateTimeKind.Utc).AddTicks(8978));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 230, DateTimeKind.Utc).AddTicks(8981));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 230, DateTimeKind.Utc).AddTicks(8983));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 230, DateTimeKind.Utc).AddTicks(8984));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2427));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2429));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2431));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2432));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2434));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2435));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2436));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2438));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2439));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2441));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 12, 3, 7, 231, DateTimeKind.Utc).AddTicks(2442));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SharedWithJson",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "UsageHistoryJson",
                table: "UserSubscriptions");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 641, DateTimeKind.Utc).AddTicks(9885));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 641, DateTimeKind.Utc).AddTicks(9887));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 641, DateTimeKind.Utc).AddTicks(9888));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 641, DateTimeKind.Utc).AddTicks(9890));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2829));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2832));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2833));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2835));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2836));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2837));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2838));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2840));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2841));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2842));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 11, 37, 47, 642, DateTimeKind.Utc).AddTicks(2844));
        }
    }
}
