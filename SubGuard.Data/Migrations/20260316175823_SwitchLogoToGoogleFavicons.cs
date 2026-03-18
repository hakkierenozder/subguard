using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class SwitchLogoToGoogleFavicons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2287), "https://logo.clearbit.com/netflix.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2289), "https://logo.clearbit.com/disneyplus.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2290), "https://logo.clearbit.com/blutv.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2292), "https://logo.clearbit.com/primevideo.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2293), "https://logo.clearbit.com/exxen.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2294), "https://logo.clearbit.com/mubi.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2295), "https://logo.clearbit.com/tod.tv" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2296), "https://logo.clearbit.com/youtube.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                columns: new[] { "ColorCode", "CreatedDate", "LogoUrl" },
                values: new object[] { "#FF6A00", new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2297), "https://logo.clearbit.com/gain.tv" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2323), "https://logo.clearbit.com/spotify.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2324), "https://logo.clearbit.com/apple.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2325), "https://logo.clearbit.com/fizy.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2326), "https://logo.clearbit.com/deezer.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2331), "https://logo.clearbit.com/playstation.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2332), "https://logo.clearbit.com/xbox.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2333), "https://logo.clearbit.com/nvidia.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2334), "https://logo.clearbit.com/discord.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2377), "https://logo.clearbit.com/hepsiburada.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2378), "https://logo.clearbit.com/yemeksepeti.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2379), "https://logo.clearbit.com/getir.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2383), "https://logo.clearbit.com/icloud.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2384), "https://logo.clearbit.com/google.com" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2385), "https://logo.clearbit.com/microsoft.com" });

            migrationBuilder.InsertData(
                table: "Catalogs",
                columns: new[] { "Id", "Category", "ColorCode", "CreatedBy", "CreatedDate", "IsDeleted", "LogoUrl", "Name", "RequiresContract", "UpdatedBy", "UpdatedDate" },
                values: new object[,]
                {
                    { 110, "Streaming", "#E8261A", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2298), false, "https://logo.clearbit.com/puhutv.com", "Puhutv", false, null, null },
                    { 111, "Streaming", "#1A936F", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2298), false, "https://logo.clearbit.com/tabii.com", "Tabii", false, null, null },
                    { 112, "Streaming", "#000000", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2299), false, "https://logo.clearbit.com/apple.com", "Apple TV+", false, null, null },
                    { 113, "Streaming", "#0064FF", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2300), false, "https://logo.clearbit.com/paramountplus.com", "Paramount+", false, null, null },
                    { 114, "Streaming", "#F47521", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2301), false, "https://logo.clearbit.com/crunchyroll.com", "Crunchyroll", false, null, null },
                    { 115, "Streaming", "#009EDB", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2302), false, "https://logo.clearbit.com/tvplus.com.tr", "Turkcell TV+", false, null, null },
                    { 205, "Music", "#000000", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2327), false, "https://logo.clearbit.com/tidal.com", "Tidal", false, null, null },
                    { 206, "Music", "#FF6B35", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2328), false, "https://logo.clearbit.com/muud.com.tr", "Muud", false, null, null },
                    { 305, "Gaming", "#1B2838", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2335), false, "https://logo.clearbit.com/steampowered.com", "Steam", false, null, null },
                    { 306, "Gaming", "#FF4747", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2336), false, "https://logo.clearbit.com/ea.com", "EA Play", false, null, null },
                    { 404, "Shopping", "#F27A1A", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2380), false, "https://logo.clearbit.com/trendyol.com", "Trendyol Premium", false, null, null },
                    { 504, "Cloud", "#0061FF", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2386), false, "https://logo.clearbit.com/dropbox.com", "Dropbox", false, null, null },
                    { 505, "Cloud", "#FF0000", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2387), false, "https://logo.clearbit.com/adobe.com", "Adobe Creative Cloud", true, null, null },
                    { 506, "Cloud", "#00C4CC", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2388), false, "https://logo.clearbit.com/canva.com", "Canva Pro", false, null, null },
                    { 507, "Cloud", "#10A37F", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2389), false, "https://logo.clearbit.com/openai.com", "ChatGPT Plus", false, null, null },
                    { 508, "Cloud", "#4687FF", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2390), false, "https://logo.clearbit.com/nordvpn.com", "NordVPN", false, null, null },
                    { 601, "Education", "#58CC02", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2395), false, "https://logo.clearbit.com/duolingo.com", "Duolingo Plus", false, null, null },
                    { 602, "Education", "#0A66C2", null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(2395), false, "https://logo.clearbit.com/linkedin.com", "LinkedIn Premium", false, null, null }
                });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9177));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9184));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9185));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9187));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9188));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9189));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9190));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9191));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9192));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9193));

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycleDays", "CatalogId", "CreatedBy", "CreatedDate", "Currency", "IsDeleted", "Name", "Price", "UpdatedBy", "UpdatedDate" },
                values: new object[,]
                {
                    { 4001, 30, 110, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9194), "TRY", false, "Bireysel", 59.99m, null, null },
                    { 4002, 30, 110, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9195), "TRY", false, "Aile", 99.99m, null, null },
                    { 4101, 30, 111, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9196), "TRY", false, "Bireysel", 39.99m, null, null },
                    { 4102, 30, 111, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9197), "TRY", false, "Aile", 59.99m, null, null },
                    { 4201, 30, 112, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9198), "TRY", false, "Bireysel", 79.99m, null, null },
                    { 4202, 30, 112, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9199), "TRY", false, "Aile", 119.99m, null, null },
                    { 4301, 30, 113, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9200), "TRY", false, "Bireysel", 49.99m, null, null },
                    { 4401, 30, 114, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9201), "TRY", false, "Fanatic", 49.99m, null, null },
                    { 4402, 30, 114, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9202), "TRY", false, "Mega Fan", 89.99m, null, null },
                    { 4501, 30, 115, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9203), "TRY", false, "Bireysel", 29.99m, null, null },
                    { 4502, 30, 115, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9204), "TRY", false, "Aile", 59.99m, null, null },
                    { 5001, 30, 205, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9205), "USD", false, "Bireysel", 12.99m, null, null },
                    { 5002, 30, 205, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9206), "USD", false, "Aile", 19.99m, null, null },
                    { 5101, 30, 306, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9207), "USD", false, "EA Play", 4.99m, null, null },
                    { 5102, 30, 306, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9208), "USD", false, "EA Play Pro", 14.99m, null, null },
                    { 5201, 30, 404, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9209), "TRY", false, "Premium Üyelik", 99.99m, null, null },
                    { 5301, 30, 504, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9210), "USD", false, "Plus (2 TB)", 9.99m, null, null },
                    { 5302, 30, 504, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9211), "USD", false, "Professional (3 TB)", 16.58m, null, null },
                    { 5401, 30, 505, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9212), "USD", false, "Tüm Uygulamalar", 54.99m, null, null },
                    { 5402, 30, 505, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9213), "USD", false, "Tek Uygulama", 20.99m, null, null },
                    { 5501, 30, 506, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9214), "TRY", false, "Pro", 119.99m, null, null },
                    { 5601, 30, 507, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9215), "USD", false, "Plus", 20.00m, null, null },
                    { 5602, 30, 507, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9216), "USD", false, "Pro", 200.00m, null, null },
                    { 5701, 30, 508, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9217), "USD", false, "Basic", 3.79m, null, null },
                    { 5702, 30, 508, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9218), "USD", false, "Plus", 4.79m, null, null },
                    { 5801, 30, 601, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9219), "USD", false, "Super", 6.99m, null, null },
                    { 5802, 30, 601, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9220), "USD", false, "Max", 13.99m, null, null },
                    { 5901, 30, 602, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9221), "USD", false, "Career", 29.99m, null, null },
                    { 5902, 30, 602, null, new DateTime(2026, 3, 16, 17, 58, 23, 296, DateTimeKind.Utc).AddTicks(9222), "USD", false, "Business", 59.99m, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901);

            migrationBuilder.DeleteData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601);

            migrationBuilder.DeleteData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4644), "netflix_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4654), "disney_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4655), "blutv_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4656), "prime_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4657), "exxen_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4658), "mubi_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4659), "tod_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4660), "youtube_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                columns: new[] { "ColorCode", "CreatedDate", "LogoUrl" },
                values: new object[] { "#FF0000", new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4661), "gain_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4687), "spotify_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4688), "applemusic_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4689), "fizy_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4690), "deezer_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4693), "psplus_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4694), "gamepass_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4695), "gfn_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4696), "discord_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4746), "hepsiburada_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4747), "yemeksepeti_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4748), "getir_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4751), "icloud_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4752), "googleone_logo" });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                columns: new[] { "CreatedDate", "LogoUrl" },
                values: new object[] { new DateTime(2026, 3, 16, 17, 42, 32, 395, DateTimeKind.Utc).AddTicks(4753), "office_logo" });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1633));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1639));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1641));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1642));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1643));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1644));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1645));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1646));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1647));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 16, 17, 42, 32, 396, DateTimeKind.Utc).AddTicks(1648));
        }
    }
}
