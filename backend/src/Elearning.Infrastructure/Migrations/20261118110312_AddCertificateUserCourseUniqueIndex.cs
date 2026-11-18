using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Elearning.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCertificateUserCourseUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Certificates_UserId",
                table: "Certificates");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_UserId_CourseId",
                table: "Certificates",
                columns: new[] { "UserId", "CourseId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Certificates_UserId_CourseId",
                table: "Certificates");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_UserId",
                table: "Certificates",
                column: "UserId");
        }
    }
}
