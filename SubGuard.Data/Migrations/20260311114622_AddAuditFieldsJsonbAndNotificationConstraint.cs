using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsJsonbAndNotificationConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // text → jsonb dönüşümü için USING cast gerekiyor (boş string'leri NULL'a çeviriyoruz)
            migrationBuilder.Sql(@"
                ALTER TABLE ""UserSubscriptions""
                    ALTER COLUMN ""UsageHistoryJson"" TYPE jsonb
                    USING CASE WHEN ""UsageHistoryJson"" IS NULL OR ""UsageHistoryJson"" = ''
                               THEN NULL ELSE ""UsageHistoryJson""::jsonb END;
                ALTER TABLE ""UserSubscriptions""
                    ALTER COLUMN ""SharedWithJson"" TYPE jsonb
                    USING CASE WHEN ""SharedWithJson"" IS NULL OR ""SharedWithJson"" = ''
                               THEN NULL ELSE ""SharedWithJson""::jsonb END;
            ");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "UserSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "UserSubscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "RefreshTokens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "RefreshTokens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Plans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Plans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "NotificationQueues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "NotificationQueues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Catalogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Catalogs",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3631), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3636), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3638), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3639), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3640), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3641), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3642), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3643), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3644), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3704), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3705), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3706), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3707), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3711), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3712), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3713), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3714), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3718), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3719), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3720), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3723), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3724), null });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 769, DateTimeKind.Utc).AddTicks(3725), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(571), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(578), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(628), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(629), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(630), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(631), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(632), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(634), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(635), null });

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                columns: new[] { "CreatedBy", "CreatedDate", "UpdatedBy" },
                values: new object[] { null, new DateTime(2026, 3, 11, 11, 46, 21, 770, DateTimeKind.Utc).AddTicks(636), null });

            migrationBuilder.CreateIndex(
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate",
                table: "NotificationQueues",
                columns: new[] { "UserId", "UserSubscriptionId", "ScheduledDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate",
                table: "NotificationQueues");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "NotificationQueues");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "NotificationQueues");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Catalogs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Catalogs");

            migrationBuilder.AlterColumn<string>(
                name: "UsageHistoryJson",
                table: "UserSubscriptions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SharedWithJson",
                table: "UserSubscriptions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

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
        }
    }
}
