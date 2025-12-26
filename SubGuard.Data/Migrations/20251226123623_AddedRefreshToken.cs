using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedRefreshToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Expiration = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(792));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(796));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(798));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(799));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(800));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(801));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(801));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(802));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(803));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(823));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(824));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(825));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(826));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(829));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(830));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(831));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(832));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(836));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(838));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(839));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(842));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(843));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(844));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3928));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3934));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3935));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3937));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3938));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3939));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3940));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3941));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3942));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 26, 12, 36, 23, 255, DateTimeKind.Utc).AddTicks(3943));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 101,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(949));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 102,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(953));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 103,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(954));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 104,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(956));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 105,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(957));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 106,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(957));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 107,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(958));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 108,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(959));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 109,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(960));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 201,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(979));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 202,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(980));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 203,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(981));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 204,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(982));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 301,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(985));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 302,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(986));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 303,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(987));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 304,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(988));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 401,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(992));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 402,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(993));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 403,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(994));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 501,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(997));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 502,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(998));

            migrationBuilder.UpdateData(
                table: "Catalogs",
                keyColumn: "Id",
                keyValue: 503,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(999));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4288));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4295));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 1003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4297));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4298));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4299));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4301));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 2004,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4302));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3001,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4303));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3002,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4304));

            migrationBuilder.UpdateData(
                table: "Plans",
                keyColumn: "Id",
                keyValue: 3003,
                column: "CreatedDate",
                value: new DateTime(2025, 12, 21, 9, 41, 38, 764, DateTimeKind.Utc).AddTicks(4305));
        }
    }
}
