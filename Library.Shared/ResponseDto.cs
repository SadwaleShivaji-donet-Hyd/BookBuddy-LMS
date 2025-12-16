using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Library.Shared
{
    public class ResponseDto
    {
        public bool IsSuccess { get; set; } = true;
        public object Result { get; set; }
        public string DisplayMessage { get; set; } = "";
        public List<string> ErrorMessages { get; set; }
    }
    public class UserDto
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public DateTime Created { get; set; }
    }

    // BookItemDto.cs (For Circulation to understand Catalog data)
    public class BookItemDto
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public int AvailableCopies { get; set; }
    }
    public class RegisterRequestDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // "Admin" or "Member"
    }

    public class LoginRequestDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    public class VerifyOtpRequestDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Otp { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        public string NewPassword { get; set; }
    }
    //login response
    public class LoginResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
    public class BookRequestDto
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public int? UserId { get; set; }
    }
    //change password
    public class ChangePasswordDto
    {
        public string Email { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
    //edit profile
    public class UpdateProfileDto
    {
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
    }
    //review AddReviewDto
    public class AddReviewDto
    {
        public int BookId { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; }
    }
    public class ReviewResultDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string DatePosted { get; set; }
    }
    //book issue
    public class BookIssue
    {
        [Key]
        public int Id { get; set; }

        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public string ImageUrl { get; set; }

        public string UserId { get; set; }
        public string UserName { get; set; }

        public DateTime IssueDate { get; set; } = DateTime.Now;
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }

        // Added for Return Logic
        public DateTime? ReturnRequestedDate { get; set; }

        // Statuses: "Issued", "ReturnPending", "Returned"
        public string Status { get; set; } = "Issued";
    }
    //return dto
    public class ReturnRequestDto
    {
        public int BookId { get; set; }
    }
}
