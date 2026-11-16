using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Elearning.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseIsOpenAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOpenAccess",
                table: "Courses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpenAccess",
                table: "Courses");
        }
    }
}
