using Library.IdentityService.Data;
using Library.IdentityService.Models;
using Library.IdentityService.Services;
using Library.Shared;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



namespace Library.IdentityService.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthRepository(AppDbContext db, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager, IConfiguration config, IEmailService emailService)
        {
            _db = db;
            _userManager = userManager;
            _roleManager = roleManager;
            _config = config;
            _emailService = emailService;
        }

        public async Task<string> Register(ApplicationUser user, string password)
        {
            // 1. Create User
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                return "Registration Failed: " + string.Join(", ", result.Errors.Select(e => e.Description));
            }

            // 2. Assign Role safely
            string roleToAssign = string.IsNullOrEmpty(user.Role) ? "User" : user.Role;

            if (await _roleManager.RoleExistsAsync(roleToAssign))
            {
                await _userManager.AddToRoleAsync(user, roleToAssign);
            }
            else
            {
                await _userManager.AddToRoleAsync(user, "User");
            }

            // 3. Send Email
            try
            {
                await _emailService.SendEmailAsync(user.Email, "Welcome", $"<h3>Welcome {user.Name}! To BookWorm</h3>");
            }
            catch (Exception ex) { Console.WriteLine("Email Failed: " + ex.Message); }

            return "Registration Successful.";
        }

        public async Task<LoginResponseDto> Login(LoginRequestDto loginRequestDto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginRequestDto.Email.ToLower());

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequestDto.Password))
            {
                return new LoginResponseDto() { User = null, Token = "" };
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

            return new LoginResponseDto
            {
                User = new UserDto
                {
                    ID = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = roles.FirstOrDefault() ?? "User",
                    Created = DateTime.Now
                },
                Token = token
            };
        }

        private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["ApiSettings:Secret"]);

            var claimList = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim("unique_name", user.Name) // Redundant but safe
            };

            claimList.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claimList),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Add GetStats / GetAllUsers logic here if needed as discussed previously
    
// --- Password Reset Logic ---

public async Task<string> ForgotPassword(string email)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return "If email exists, OTP sent.";

            var otp = new Random().Next(100000, 999999).ToString();
            user.Otp = otp;
            user.OtpExpiration = DateTime.Now.AddMinutes(15);
            await _db.SaveChangesAsync();

            try { await _emailService.SendEmailAsync(user.Email, "Reset OTP", $"OTP: {otp}"); }
            catch { /* Log error */ }

            return "OTP sent.";
        }

        public async Task<string> ResetPassword(string email, string otp, string newPassword)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.Otp != otp || user.OtpExpiration < DateTime.Now) return "Invalid OTP";

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded) return "Error resetting password";

            user.Otp = null;
            user.OtpExpiration = null;
            await _db.SaveChangesAsync();

            return "Password Reset Successfully.";
        }

        //change password
        public async Task<bool> ChangePassword(ChangePasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return false;

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            return result.Succeeded;
        }
        //edit profile
        public async Task<bool> UpdateUser(string userId, UpdateProfileDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.Name = model.Name;
            user.PhoneNumber = model.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }
        // --- Admin Stats ---

        public async Task<IEnumerable<object>> GetAllUsers()
        {
            // No changes needed here, assuming database columns are correct
            return await _db.Users.Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.Created
            }).ToListAsync();
        }

        public async Task<int> GetUserCount() => await _db.Users.CountAsync(u => u.Role != "Admin");
        public async Task<int> GetAdminCount() => await _db.Users.CountAsync(u => u.Role == "Admin");
    }
}