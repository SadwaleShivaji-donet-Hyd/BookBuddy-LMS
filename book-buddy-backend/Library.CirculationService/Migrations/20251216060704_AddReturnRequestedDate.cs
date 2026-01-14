using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.CirculationService.Migrations
{
    /// <inheritdoc />
    public partial class AddReturnRequestedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReturnRequestedDate",
                table: "Transactions",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReturnRequestedDate",
                table: "Transactions");
        }
    }
}
