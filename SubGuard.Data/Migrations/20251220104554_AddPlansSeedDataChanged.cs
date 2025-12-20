using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlansSeedDataChanged : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(2058));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(2061));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(2063));

            migrationBuilder.InsertData(
                table: "Catalogs",
                columns: new[] { "Id", "Category", "ColorCode", "CreatedDate", "IsDeleted", "LogoUrl", "Name", "RequiresContract", "UpdatedDate" },
                values: new object[] { 4, "Cloud", "#000000", new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(2064), false, null, "Apple iCloud", false, null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4904));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4905));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4907));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4908));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4910));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4911));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4912));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4914));

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "BillingCycleDays", "CatalogId", "CreatedDate", "Currency", "IsDeleted", "Name", "Price", "UpdatedDate" },
                values: new object[,]
                {
                    { 9, 30, 4, new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4915), "USD", false, "50 GB", 0.99m, null },
                    { 10, 30, 4, new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4916), "USD", false, "200 GB", 2.99m, null },
                    { 11, 30, 4, new DateTime(2025, 12, 20, 10, 45, 54, 17, DateTimeKind.Utc).AddTicks(4918), "USD", false, "2 TB", 9.99m, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                keyValue: 4);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2253));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2255));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(2257));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5114));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5116));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5117));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5118));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5120));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5121));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5122));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 19, 15, 31, 58, 468, DateTimeKind.Utc).AddTicks(5124));
        }
    }
}
