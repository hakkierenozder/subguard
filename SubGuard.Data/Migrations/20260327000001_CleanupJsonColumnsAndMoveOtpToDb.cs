using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class CleanupJsonColumnsAndMoveOtpToDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── 1. UserSubscriptions: Eski JSON kolonlarını kaldır ──────────────
            // SharedWithJson ve UsageHistoryJson artık ilişkisel tablolara (SubscriptionShares,
            // SubscriptionUsageLogs) taşındı. Bu kolonlar tüm kod yollarında kullanılmıyor.
            migrationBuilder.DropColumn(
                name: "SharedWithJson",
                table: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "UsageHistoryJson",
                table: "UserSubscriptions");

            // ── 2. AspNetUsers: OTP alanları ekle (restart-safe, multi-instance uyumlu) ──
            // IMemoryCache tabanlı OTP yerine DB kolonları kullanılıyor.
            migrationBuilder.AddColumn<string>(
                name: "OtpCode",
                table: "AspNetUsers",
                type: "character varying(6)",
                maxLength: 6,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtpToken",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtpType",
                table: "AspNetUsers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OtpExpiry",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            // ── 3. SubscriptionShares: BaseEntity alanları ekle ─────────────────
            // Entity artık BaseEntity'den türüyor; soft delete + audit desteği kazanıyor.
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SubscriptionShares",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "SubscriptionShares",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "SubscriptionShares",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "SubscriptionShares",
                type: "text",
                nullable: true);

            // ── 4. SubscriptionUsageLogs: BaseEntity alanları ekle ──────────────
            // CreatedDate zaten var, diğer audit alanları ekleniyor.
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SubscriptionUsageLogs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "SubscriptionUsageLogs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "SubscriptionUsageLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "SubscriptionUsageLogs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // AspNetUsers OTP alanları
            migrationBuilder.DropColumn(name: "OtpCode",   table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "OtpToken",  table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "OtpType",   table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "OtpExpiry", table: "AspNetUsers");

            // SubscriptionShares BaseEntity alanları
            migrationBuilder.DropColumn(name: "IsDeleted",  table: "SubscriptionShares");
            migrationBuilder.DropColumn(name: "UpdatedDate", table: "SubscriptionShares");
            migrationBuilder.DropColumn(name: "CreatedBy",  table: "SubscriptionShares");
            migrationBuilder.DropColumn(name: "UpdatedBy",  table: "SubscriptionShares");

            // SubscriptionUsageLogs BaseEntity alanları
            migrationBuilder.DropColumn(name: "IsDeleted",  table: "SubscriptionUsageLogs");
            migrationBuilder.DropColumn(name: "UpdatedDate", table: "SubscriptionUsageLogs");
            migrationBuilder.DropColumn(name: "CreatedBy",  table: "SubscriptionUsageLogs");
            migrationBuilder.DropColumn(name: "UpdatedBy",  table: "SubscriptionUsageLogs");

            // UserSubscriptions JSON kolonlarını geri ekle
            migrationBuilder.AddColumn<string>(
                name: "SharedWithJson",
                table: "UserSubscriptions",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsageHistoryJson",
                table: "UserSubscriptions",
                type: "jsonb",
                nullable: true);
        }
    }
}
