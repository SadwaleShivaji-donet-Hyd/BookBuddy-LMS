using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Library.IdentityService.Models
{
    // Inherit from IdentityUser<int> so the ID is an Integer
    public class ApplicationUser : IdentityUser<int>
    {
        // REMOVED: Id, Email, PasswordHash (These are inherited from IdentityUser)

        public string Name { get; set; }

        // Note: Identity has its own Roles table, but keeping this string for your simple JWT logic is fine.
        public string Role { get; set; } = "Member";

        public DateTime Created { get; set; } = DateTime.Now;

        //// Security Fields
        public bool IsVerified { get; set; } = false;
        public string? Otp { get; set; }
        public DateTime? OtpExpiration { get; set; }
    }
}