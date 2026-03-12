using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubGuard.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingPeriod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BillingPeriod",
                table: "UserSubscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 1); // Monthly = 1
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillingPeriod",
                table: "UserSubscriptions");
        }
    }
}
