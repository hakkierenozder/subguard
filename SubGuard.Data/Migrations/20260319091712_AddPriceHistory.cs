using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PriceHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubscriptionId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    OldPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    NewPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceHistories", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5448));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5457));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5459));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5461));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5462));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5464));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5465));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5466));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5467));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5469));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5470));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5471));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5472));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5473));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5475));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5499));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5500));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5501));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5502));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5503));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5505));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5510));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5511));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5513));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5514));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5515));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5541));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5546));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5550));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5552));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5554));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5559));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5561));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5563));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5565));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5566));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5568));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5569));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5570));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5575));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 603, DateTimeKind.Utc).AddTicks(5576));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3683));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3694));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3695));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3697));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3698));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3700));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3701));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3702));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3703));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3704));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3705));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3706));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3708));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3709));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3710));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3711));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3712));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3713));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3713));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3714));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3715));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3716));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3717));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3718));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3719));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3720));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3721));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3722));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3723));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3724));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3725));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3726));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3730));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3731));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3733));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3734));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3735));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3739));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 17, 12, 604, DateTimeKind.Utc).AddTicks(3740));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PriceHistories");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(136));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(146));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(149));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(151));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(152));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(153));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(154));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(155));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(156));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 110,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(158));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 111,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(159));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 112,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(160));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 113,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(161));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 114,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(162));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 115,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(163));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(187));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(188));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(189));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(190));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 205,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(191));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 206,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(193));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(197));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(198));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(200));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(201));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 305,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(202));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 306,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(203));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(207));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(255));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(257));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 404,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(259));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(263));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(265));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(266));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 504,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(268));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 505,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(269));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 506,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(270));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 507,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(271));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 508,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(272));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(277));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(279));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7521));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7527));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7528));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7530));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7531));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7532));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7533));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7534));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7535));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7536));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7537));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7538));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7539));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7540));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7541));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4202,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7542));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7543));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7544));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7545));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7546));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 4502,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7547));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5001,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7548));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5002,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7549));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5101,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7550));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5102,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7551));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5201,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7552));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5301,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7553));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5302,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7554));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5401,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7555));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5402,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7556));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5501,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7557));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5601,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7558));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5602,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7559));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5701,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7560));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5702,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7561));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5801,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7562));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5802,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7563));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5901,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7564));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 5902,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 19, 9, 14, 2, 53, DateTimeKind.Utc).AddTicks(7565));
        }
    }
}
