using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryBudgets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoryBudgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    MonthlyLimit = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryBudgets", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5305));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5313));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5315));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5316));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5317));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5318));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5319));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5321));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5355));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5357));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5358));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5359));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5360));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5361));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5362));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5385));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5387));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5389));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5391));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5393));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5394));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5398));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5400));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5401));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5402));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5403));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5404));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5408));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5409));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5410));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5411));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5414));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5415));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5416));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5417));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5443));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5445));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5446));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5447));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5452));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 97, DateTimeKind.Utc).AddTicks(5453));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2113));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2162));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2164));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2165));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2167));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2168));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2169));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2170));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2171));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2172));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2173));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2174));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2175));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2176));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2177));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2178));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2179));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2180));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2181));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2182));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2183));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2184));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2185));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2186));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2187));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2188));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2189));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2190));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2191));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2192));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2193));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2194));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2195));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2196));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2197));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2198));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2199));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2200));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 39, 51, 98, DateTimeKind.Utc).AddTicks(2201));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoryBudgets");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(269));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(277));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(279));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(281));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(282));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(283));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(284));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(286));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(324));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(325));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(326));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(327));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(329));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(330));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(331));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(352));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(354));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(355));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(356));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(357));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(359));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(363));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(365));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(366));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(367));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(369));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(370));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(374));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(375));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(377));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(378));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(381));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(382));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(383));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(384));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(437));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(438));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(439));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(440));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(446));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(447));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7502));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7508));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7553));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7555));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7556));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7557));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7558));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7559));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7561));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7562));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7563));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7564));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7565));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7566));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7567));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7568));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7568));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7569));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7570));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7571));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7572));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7573));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7574));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7575));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7576));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7577));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7578));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7579));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7580));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7581));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7582));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7584));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7585));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7586));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7587));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7588));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7589));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7590));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 8, 3, 28, 203, DateTimeKind.Utc).AddTicks(7591));
        }
    }
}
