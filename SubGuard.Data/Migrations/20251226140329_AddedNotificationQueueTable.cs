using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedNotificationQueueTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationQueues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    UserSubscriptionId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsSent = table.Column<bool>(type: "boolean", nullable: false),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationQueues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationQueues_UserSubscriptions_UserSubscriptionId",
                        column: x => x.UserSubscriptionId,
                        principalTable: "UserSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_NotificationQueues_UserSubscriptionId",
                table: "NotificationQueues",
                column: "UserSubscriptionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationQueues");

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
    }
}
