using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSubscriptions_Catalogs_CatalogId",
                table: "UserSubscriptions");

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AlterColumn<int>(
                name: "CatalogId",
                table: "UserSubscriptions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.InsertData(
                table: "Catalogs",
                columns: new[] { "Id", "Category", "ColorCode", "CreatedDate", "IsDeleted", "LogoUrl", "Name", "RequiresContract", "UpdatedDate" },
                values: new object[,]
                {
                    { 101, "Streaming", "#E50914", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(859), false, "netflix_logo", "Netflix", false, null },
                    { 102, "Streaming", "#113CCF", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(863), false, "disney_logo", "Disney+", false, null },
                    { 103, "Streaming", "#11D6D4", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(865), false, "blutv_logo", "BluTV", false, null },
                    { 104, "Streaming", "#00A8E1", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(866), false, "prime_logo", "Amazon Prime", false, null },
                    { 105, "Streaming", "#FFD600", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(867), false, "exxen_logo", "Exxen", false, null },
                    { 106, "Streaming", "#191919", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(868), false, "mubi_logo", "MUBI", false, null },
                    { 107, "Streaming", "#592878", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(868), false, "tod_logo", "TOD (beIN)", true, null },
                    { 108, "Streaming", "#FF0000", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(869), false, "youtube_logo", "YouTube Premium", false, null },
                    { 109, "Streaming", "#FF0000", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(870), false, "gain_logo", "Gain", false, null },
                    { 201, "Music", "#1DB954", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(889), false, "spotify_logo", "Spotify", false, null },
                    { 202, "Music", "#FA243C", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(890), false, "applemusic_logo", "Apple Music", false, null },
                    { 203, "Music", "#F39200", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(926), false, "fizy_logo", "Fizy", false, null },
                    { 204, "Music", "#EF5466", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(928), false, "deezer_logo", "Deezer", false, null },
                    { 301, "Gaming", "#00439C", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(931), false, "psplus_logo", "PlayStation Plus", false, null },
                    { 302, "Gaming", "#107C10", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(932), false, "gamepass_logo", "Xbox Game Pass", false, null },
                    { 303, "Gaming", "#76B900", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(933), false, "gfn_logo", "GeForce Now", false, null },
                    { 304, "Gaming", "#5865F2", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(934), false, "discord_logo", "Discord Nitro", false, null },
                    { 401, "Shopping", "#FF6000", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(938), false, "hepsiburada_logo", "Hepsiburada Premium", false, null },
                    { 402, "Food", "#EA004B", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(939), false, "yemeksepeti_logo", "Yemeksepeti Club", false, null },
                    { 403, "Food", "#5D3EB2", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(940), false, "getir_logo", "Getir", false, null },
                    { 501, "Cloud", "#007AFF", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(943), false, "icloud_logo", "Apple iCloud", false, null },
                    { 502, "Cloud", "#4285F4", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(944), false, "googleone_logo", "Google One", false, null },
                    { 503, "Cloud", "#EA3E23", new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(945), false, "office_logo", "Microsoft 365", true, null }
                });

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycleDays", "CatalogId", "CreatedDate", "Currency", "IsDeleted", "Name", "Price", "UpdatedDate" },
                values: new object[,]
                {
                    { 1001, 30, 101, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4247), "TRY", false, "Temel Plan", 149.99m, null },
                    { 1002, 30, 101, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4253), "TRY", false, "Standart Plan", 229.99m, null },
                    { 1003, 30, 101, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4255), "TRY", false, "Özel Plan", 299.99m, null },
                    { 2001, 30, 201, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4256), "TRY", false, "Bireysel", 59.99m, null },
                    { 2002, 30, 201, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4257), "TRY", false, "Öğrenci", 32.99m, null },
                    { 2003, 30, 201, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4258), "TRY", false, "Duo", 79.99m, null },
                    { 2004, 30, 201, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4259), "TRY", false, "Aile", 99.99m, null },
                    { 3001, 30, 108, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4260), "TRY", false, "Bireysel", 57.99m, null },
                    { 3002, 30, 108, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4261), "TRY", false, "Aile", 115.99m, null },
                    { 3003, 30, 108, new DateTime(2025, 12, 20, 20, 27, 57, 661, DateTimeKind.Utc).AddTicks(4262), "TRY", false, "Öğrenci", 37.99m, null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_UserSubscriptions_Catalogs_CatalogId",
                table: "UserSubscriptions",
                column: "CatalogId",
                principalTable: "Catalogs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSubscriptions_Catalogs_CatalogId",
                table: "UserSubscriptions");

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201);

            migrationBuilder.AlterColumn<int>(
                name: "CatalogId",
                table: "UserSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Catalogs",
                columns: new[] { "Id", "Category", "ColorCode", "CreatedDate", "IsDeleted", "LogoUrl", "Name", "RequiresContract", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, "Streaming", "#E50914", new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(5772), false, null, "Netflix", false, null },
                    { 2, "GSM", "#FFC900", new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(5774), false, null, "Turkcell", true, null },
                    { 3, "Music", "#1DB954", new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(5775), false, null, "Spotify", false, null },
                    { 4, "Cloud", "#000000", new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(5777), false, null, "Apple iCloud", false, null }
                });

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycleDays", "CatalogId", "CreatedDate", "Currency", "IsDeleted", "Name", "Price", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, 30, 1, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9156), "TRY", false, "Temel", 119.99m, null },
                    { 2, 30, 1, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9159), "TRY", false, "Standart", 176.99m, null },
                    { 3, 30, 1, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9160), "TRY", false, "Özel", 229.99m, null },
                    { 4, 30, 2, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9162), "TRY", false, "Bireysel", 59.99m, null },
                    { 5, 30, 2, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9163), "TRY", false, "Duo", 79.99m, null },
                    { 6, 30, 2, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9164), "TRY", false, "Aile", 99.99m, null },
                    { 7, 30, 3, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9166), "TRY", false, "Platinum 20GB", 350.00m, null },
                    { 8, 30, 3, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9167), "TRY", false, "Gülümseten 10GB", 220.00m, null },
                    { 9, 30, 4, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9168), "USD", false, "50 GB", 0.99m, null },
                    { 10, 30, 4, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9169), "USD", false, "200 GB", 2.99m, null },
                    { 11, 30, 4, new DateTime(2025, 12, 20, 17, 20, 55, 184, DateTimeKind.Utc).AddTicks(9171), "USD", false, "2 TB", 9.99m, null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_UserSubscriptions_Catalogs_CatalogId",
                table: "UserSubscriptions",
                column: "CatalogId",
                principalTable: "Catalogs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
