using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlansSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Catalogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ColorCode = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false),
                    RequiresContract = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Catalogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    BillingCycleDays = table.Column<int>(type: "integer", nullable: false),
                    CatalogId = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Plans_Catalogs_CatalogId",
                        column: x => x.CatalogId,
                        principalTable: "Catalogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Catalogs",
                columns: new[] { "Id", "Category", "ColorCode", "CreatedDate", "IsDeleted", "LogoUrl", "Name", "RequiresContract", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, "Streaming", "#E50914", new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2253), false, null, "Netflix", false, null },
                    { 2, "GSM", "#FFC900", new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2255), false, null, "Turkcell", true, null },
                    { 3, "Music", "#1DB954", new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2257), false, null, "Spotify", false, null }
                });

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycleDays", "CatalogId", "CreatedDate", "Currency", "IsDeleted", "Name", "Price", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, 30, 1, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5114), "TRY", false, "Temel", 119.99m, null },
                    { 2, 30, 1, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5116), "TRY", false, "Standart", 176.99m, null },
                    { 3, 30, 1, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5117), "TRY", false, "Özel", 229.99m, null },
                    { 4, 30, 2, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5118), "TRY", false, "Bireysel", 59.99m, null },
                    { 5, 30, 2, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5120), "TRY", false, "Duo", 79.99m, null },
                    { 6, 30, 2, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5121), "TRY", false, "Aile", 99.99m, null },
                    { 7, 30, 3, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5122), "TRY", false, "Platinum 20GB", 350.00m, null },
                    { 8, 30, 3, new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5124), "TRY", false, "Gülümseten 10GB", 220.00m, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Plans_CatalogId",
                table: "Plans",
                column: "CatalogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Plans");

            migrationBuilder.DropTable(
                name: "Catalogs");
        }
    }
}
