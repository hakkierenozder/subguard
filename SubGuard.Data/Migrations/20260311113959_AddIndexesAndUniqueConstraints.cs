using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesAndUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "NotificationQueues",
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
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2235));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2241));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2242));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2243));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2245));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2246));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2247));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2248));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2248));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2267));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2268));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2269));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2270));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2273));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2275));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2276));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2277));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2280));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2281));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2316));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2319));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2320));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(2321));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8763));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8771));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8772));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8773));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8816));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8817));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8818));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8819));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8820));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 11, 11, 39, 59, 498, DateTimeKind.Utc).AddTicks(8822));

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId",
                table: "UserSubscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions",
                columns: new[] { "UserId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Code",
                table: "RefreshTokens",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "UQ_RefreshTokens_Code_UserId",
                table: "RefreshTokens",
                columns: new[] { "Code", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationQueue_UserId_IsSent",
                table: "NotificationQueues",
                columns: new[] { "UserId", "IsSent" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSubscriptions_UserId",
                table: "UserSubscriptions");

            migrationBuilder.DropIndex(
                name: "UQ_UserSubscriptions_UserId_Name",
                table: "UserSubscriptions");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_Code",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "UQ_RefreshTokens_Code_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_NotificationQueue_UserId_IsSent",
                table: "NotificationQueues");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "NotificationQueues",
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
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(403));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(409));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(410));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(411));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(413));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(414));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(415));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(416));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(417));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(445));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(446));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(448));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(449));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(453));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(499));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(501));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(502));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(508));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(510));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(511));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(514));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(515));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(516));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4582));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4590));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4592));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4593));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4594));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4595));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4597));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4598));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4599));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 14, 3, 28, 885, DateTimeKind.Utc).AddTicks(4600));
        }
    }
}
