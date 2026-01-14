using Library.IdentityService.Models;
using Library.IdentityService.Repository;
using Library.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Library.IdentityService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        protected ResponseDto _response;
        private readonly UserManager<ApplicationUser> _userManager;
        public AuthController(IAuthRepository repo, UserManager<ApplicationUser> userManager)
        {
            _repo = repo;
            _userManager = userManager;
            _response = new ResponseDto();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            var loginResponse = await _repo.Login(model);

            if (loginResponse.User == null)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Invalid Email or Password";
                return BadRequest(_response);
            }

            _response.Result = loginResponse;
            _response.DisplayMessage = "Login Successful";
            return Ok(_response);
        }

        // --- PUBLIC REGISTER (Forces "User" Role) ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
        {
            model.Role = "User"; // Security: Force role
            return await RegisterInternal(model);
        }

        // --- ADMIN REGISTER (Allows creating other Admins) ---
        [HttpPost("admin/register")]
        [Authorize(Roles = "Admin")] // Only Admins can access
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequestDto model)
        {
            // Allows "Admin" role from Frontend
            return await RegisterInternal(model);
        }

        private async Task<IActionResult> RegisterInternal(RegisterRequestDto model)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email, // Fixes "Invalid Username" error
                Email = model.Email,
                Name = model.Name,
                Role = model.Role,
                NormalizedEmail = model.Email.ToUpper()
            };

            var result = await _repo.Register(user, model.Password);

            if (result != "Registration Successful.")
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = result;
                return BadRequest(_response);
            }

            _response.DisplayMessage = result;
            return Ok(_response);
        }
        // Step 1: User sends Email/Pass -> Server sends OTP Email


        //// Step 2: User sends Email/OTP -> Server returns JWT Token
        //[HttpPost("verify-otp")]
        //public async Task<object> VerifyOtp([FromBody] VerifyOtpRequestDto model)
        //{
        //    var token = await _repo.VerifyOtpAndGetToken(model.Email, model.Otp);

        //    if (token == null)
        //    {
        //        _response.IsSuccess = false;
        //        _response.DisplayMessage = "Invalid or Expired OTP";
        //        return BadRequest(_response);
        //    }

        //    _response.Result = new UserDto { Email = model.Email, Token = token };
        //    return Ok(_response);
        //}



        //pasword reset and recovery
        [HttpPost("forgot-password")]
        public async Task<object> ForgotPassword([FromBody] string email)
        {
            var result = await _repo.ForgotPassword(email);
            _response.Result = result;
            return Ok(_response);
        }

        [HttpPost("reset-password")]
        public async Task<object> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var result = await _repo.ResetPassword(model.Email, model.Otp, model.NewPassword);
            if (result != "Password Reset Successfully.")
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = result;
                return BadRequest(_response);
            }
            _response.Result = result;
            return Ok(_response);
        }

        //get all users and stats
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                // ✅ FIX: Use 'await' to get the actual data list
                var users = await _repo.GetAllUsers();

                _response.Result = users;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Error fetching users: " + ex.Message;
                return BadRequest(_response);
            }
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<object> GetStats()
        {
            var users = await _repo.GetUserCount();
            var admins = await _repo.GetAdminCount();
            return Ok(new { UserCount = users, AdminCount = admins });
        }
        [HttpGet("profile")]
        [Authorize] // ✅ Only logged-in users can access
        public async Task<IActionResult> GetUserProfile()
        {
            // Get User ID from the Token
            var userId = User.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId)) return BadRequest("Invalid Token");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            // Return the fresh details
            return Ok(new
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber ?? "N/A"
            });
        }
        //change password
        [HttpPost("change-password")]
        [Authorize] // Only logged-in users can do this
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var success = await _repo.ChangePassword(model);
            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Password change failed. Check your current password.";
                return BadRequest(_response);
            }
            _response.DisplayMessage = "Password changed successfully!";
            return Ok(_response);
        }
        //edit profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            // Get User ID safely from Token
            var userId = User.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _repo.UpdateUser(userId, model);

            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Failed to update profile.";
                return BadRequest(_response);
            }

            _response.DisplayMessage = "Profile updated successfully!";
            return Ok(_response);
        }
    }
}