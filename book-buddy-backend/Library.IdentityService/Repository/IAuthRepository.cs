using Library.IdentityService.Models;
using Library.Shared;

namespace Library.IdentityService.Repository
{
    public interface IAuthRepository
    {

        //get all users
        Task<IEnumerable<object>> GetAllUsers();
        //count of user and admin
        Task<int> GetUserCount(); // For Dashboard Stats
        Task<int> GetAdminCount(); // For Dashboard Stats
        Task<string> Register(ApplicationUser user, string password);
        Task<LoginResponseDto> Login(LoginRequestDto loginRequestDto);
        //Task<string> LoginInitial(string email, string password); // Step 1: Check pass, send OTP
        //Task<string> VerifyOtpAndGetToken(string email, string otp); // Step 2: Check OTP, give Token
        //forget password and reset password
        Task<string> ForgotPassword(string email);
        Task<string> ResetPassword(string email, string otp, string newPassword);
        //change password
        Task<bool> ChangePassword(ChangePasswordDto model);
        //edit profile
        Task<bool> UpdateUser(string userId, UpdateProfileDto model);
    }
}
