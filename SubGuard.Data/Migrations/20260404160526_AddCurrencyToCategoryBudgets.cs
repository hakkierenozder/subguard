using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyToCategoryBudgets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "CategoryBudgets",
                type: "text",
                nullable: false,
                defaultValue: "TRY");

            migrationBuilder.Sql(
                """
                UPDATE "CategoryBudgets" AS cb
                SET "Currency" = COALESCE(NULLIF(u."MonthlyBudgetCurrency", ''), 'TRY')
                FROM "AspNetUsers" AS u
                WHERE u."Id" = cb."UserId";
                """);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2806));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2815));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2818));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2819));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2821));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2822));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2823));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2824));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2826));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2827));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2828));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2829));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2830));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2831));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2833));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2851));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2852));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2853));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2854));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2855));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2856));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2861));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2862));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2863));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2864));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2865));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2892));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2896));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2897));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2898));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2899));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2903));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2907));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2908));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2909));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2910));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2911));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2913));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2914));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2918));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(2919));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9787));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9795));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9796));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9798));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9799));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9800));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9801));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9802));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9803));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9804));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9805));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9806));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9807));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9808));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9809));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9810));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9811));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9812));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9813));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9814));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9815));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9816));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9817));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9818));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9819));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9820));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9821));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9822));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9823));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9824));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9825));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9826));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9827));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9828));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9829));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9830));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9831));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9832));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 4, 16, 5, 25, 658, DateTimeKind.Utc).AddTicks(9833));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "CategoryBudgets");

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
        }
    }
}
