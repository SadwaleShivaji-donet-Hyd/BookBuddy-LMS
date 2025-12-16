using Library.IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Library.IdentityService.Data
{
    public interface IDbInitializer
    {
        void Initialize();
    }

    public class DbInitializer : IDbInitializer
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;

        public DbInitializer(AppDbContext db, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager)
        {
            _db = db;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public void Initialize()
        {
            // 1. Apply Migrations
            try
            {
                if (_db.Database.GetPendingMigrations().Count() > 0)
                {
                    _db.Database.Migrate();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Migration Error: " + ex.Message);
            }

            // 2. Create Roles (Check individually)
            if (!_roleManager.RoleExistsAsync("Admin").GetAwaiter().GetResult())
            {
                _roleManager.CreateAsync(new IdentityRole<int>("Admin")).GetAwaiter().GetResult();
            }
            if (!_roleManager.RoleExistsAsync("User").GetAwaiter().GetResult())
            {
                _roleManager.CreateAsync(new IdentityRole<int>("User")).GetAwaiter().GetResult();
            }

            // 3. Create Admin User (Check if USER exists, not just role)
            var adminUser = _userManager.FindByEmailAsync("admin@bookworm.com").GetAwaiter().GetResult();
            if (adminUser == null)
            {
                ApplicationUser user = new ApplicationUser
                {
                    UserName = "admin@bookworm.com",
                    Email = "admin@bookworm.com",
                    Name = "Super Admin",
                    PhoneNumber = "1234567890",
                    Role = "Admin",
                    EmailConfirmed = true
                };

                var result = _userManager.CreateAsync(user, "Admin@123").GetAwaiter().GetResult();

                if (result.Succeeded)
                {
                    _userManager.AddToRoleAsync(user, "Admin").GetAwaiter().GetResult();
                }
            }
        }
    }
}