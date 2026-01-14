using Library.IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Library.IdentityService.Data
{
    // We must specify <User, Role, KeyType> because we are using 'int' for IDs
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // REMOVED: "public DbSet<ApplicationUser> Users" 
        // Reason: IdentityDbContext ALREADY contains "Users", declaring it again causes errors.
    }
}