using Library.CirculationService.Models; // Ensure you have DTOs here
using Library.CirculationService.Repository;
using Library.CirculationService.Services;
using Library.Shared; // For ResponseDto
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Library.CirculationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CirculationController : ControllerBase
    {
        private readonly ITransactionRepository _txnRepo;
        private readonly ICatalogProxy _catalogProxy;
        protected ResponseDto _response;

        public CirculationController(ITransactionRepository txnRepo, ICatalogProxy catalogProxy)
        {
            _txnRepo = txnRepo;
            _catalogProxy = catalogProxy;
            _response = new ResponseDto();
        }

        // =========================================================================
        // 👤 USER ENDPOINTS
        // =========================================================================

        [HttpPost("request")]
        [Authorize]
        public async Task<IActionResult> RequestBook([FromBody] BookRequestDto requestDto)
        {
            try
            {
                int userId = GetUserIdFromToken();
                if (userId == 0) return BadRequest("Invalid User ID in Token");

                string userName = User.FindFirst(JwtRegisteredClaimNames.Name)?.Value
                                  ?? User.FindFirst("unique_name")?.Value
                                  ?? "Unknown";

                string result = await _txnRepo.RequestBookAsync(requestDto.BookId, userId, userName, requestDto.BookTitle);

                if (result != "Success")
                {
                    _response.IsSuccess = false;
                    _response.DisplayMessage = result;
                    return BadRequest(_response);
                }

                _response.DisplayMessage = "Book Requested Successfully. Pending Admin Approval.";
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Error: " + ex.Message;
                return StatusCode(500, _response);
            }
        }

        [HttpDelete("cancel/{transactionId}")]
        [Authorize]
        public async Task<IActionResult> CancelRequest(int transactionId)
        {
            int userId = GetUserIdFromToken();
            bool success = await _txnRepo.CancelRequestAsync(transactionId, userId);

            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Could not cancel request.";
                return BadRequest(_response);
            }

            _response.DisplayMessage = "Request Cancelled.";
            return Ok(_response);
        }

        [HttpGet("my-history")]
        [Authorize]
        public async Task<IActionResult> GetMyHistory()
        {
            int userId = GetUserIdFromToken();
            var history = await _txnRepo.GetUserHistoryAsync(userId);
            _response.Result = history;
            return Ok(_response);
        }

        [HttpGet("my-stats")]
        [Authorize]
        public async Task<IActionResult> GetMyStats()
        {
            int userId = GetUserIdFromToken();
            var (issued, returned, fines) = await _txnRepo.GetUserStatsAsync(userId);

            _response.Result = new { issued, returned, fines };
            return Ok(_response);
        }

        [HttpGet("notifications")]
        [Authorize]
        public async Task<IActionResult> GetNotifications()
        {
            int userId = GetUserIdFromToken();
            var list = await _txnRepo.GetUserNotificationsAsync(userId);
            _response.Result = list;
            return Ok(_response);
        }

        [HttpPost("waitlist")]
        [Authorize]
        public async Task<IActionResult> JoinWaitlist([FromBody] BookRequestDto requestDto)
        {
            int userId = GetUserIdFromToken();
            string result = await _txnRepo.JoinWaitlistAsync(requestDto.BookId, userId, requestDto.BookTitle);

            if (result != "Success")
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = result;
                return BadRequest(_response);
            }

            _response.DisplayMessage = "Added to Waitlist!";
            return Ok(_response);
        }

        // ✅ FIXED RETURN REQUEST ENDPOINT
        [HttpPost("return-request")]
        [Authorize]
        public async Task<IActionResult> RequestReturn([FromBody] ReturnRequestDto model)
        {
            // 1. Get User ID safely (INT)
            int userId = GetUserIdFromToken();
            if (userId == 0) return Unauthorized();

            // 2. Call Repository (Passing INT directly)
            var success = await _txnRepo.RequestReturnAsync(userId, model.BookId);

            // 3. Handle Result
            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "No active loan found for this book.";
                return BadRequest(_response);
            }

            _response.IsSuccess = true;
            _response.DisplayMessage = "Return requested! Waiting for admin approval.";
            return Ok(_response);
        }

        // =========================================================================
        // 👮 ADMIN ENDPOINTS
        // =========================================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTransactions([FromQuery] string? status)
        {
            var list = await _txnRepo.GetAllTransactionsAsync(status);
            _response.Result = list;
            return Ok(_response);
        }

        [HttpPut("approve/{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(int transactionId)
        {
            string result = await _txnRepo.ApproveRequestAsync(transactionId);

            if (result != "Success")
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = result;
                return BadRequest(_response);
            }

            _response.DisplayMessage = "Book Issued Successfully.";
            return Ok(_response);
        }

        [HttpPut("reject/{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(int transactionId)
        {
            bool success = await _txnRepo.RejectRequestAsync(transactionId);
            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Failed to reject.";
                return BadRequest(_response);
            }
            _response.DisplayMessage = "Request Rejected.";
            return Ok(_response);
        }

        [HttpPut("return/{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReturnBook(int transactionId)
        {
            double fine = await _txnRepo.ReturnBookAsync(transactionId);

            if (fine == -1)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Return Failed (Book not issued?).";
                return BadRequest(_response);
            }

            _response.Result = new { FineAmount = fine };
            _response.DisplayMessage = fine > 0
                ? $"Book Returned. LATE FEE: ${fine}"
                : "Book Returned Successfully (No Fine).";

            return Ok(_response);
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStats()
        {
            var (borrowed, returned, requested) = await _txnRepo.GetStatsAsync();
            _response.Result = new { Borrowed = borrowed, Returned = returned, Requested = requested };
            return Ok(_response);
        }

        [HttpGet("stats/weekly")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetWeeklyStats()
        {
            var stats = await _txnRepo.GetWeeklyStatsAsync();
            var result = stats.Select(s => new
            {
                name = s.Date.ToString("ddd"),
                requests = s.Count
            });
            _response.Result = result;
            return Ok(_response);
        }

        [HttpPost("pay-fine/{transactionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PayFine(int transactionId)
        {
            bool success = await _txnRepo.PayFineAsync(transactionId);
            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Payment failed.";
                return BadRequest(_response);
            }
            _response.DisplayMessage = "Fine paid successfully.";
            return Ok(_response);
        }

        // ✅ ADMIN RETURN APPROVAL
        [HttpGet("admin/pending-returns")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingReturns()
        {
            var list = await _txnRepo.GetPendingReturnsAsync();
            _response.Result = list; // Returns raw list directly or wrapped in result
            return Ok(new { IsSuccess = true, Result = list });
        }

        [HttpPost("admin/approve-return/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveReturn(int id)
        {
            var success = await _txnRepo.ApproveReturnAsync(id);
            if (!success) return BadRequest(new { IsSuccess = false, Message = "Record not found" });

            return Ok(new { IsSuccess = true, Message = "Return Approved Successfully!" });
        }
        //top books and top users
        [HttpGet("stats/top-books")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTopBooks()
        {
            var result = await _txnRepo.GetTopBooksAsync();
            _response.Result = result;
            return Ok(_response);
        }

        [HttpGet("stats/top-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTopUsers()
        {
            var result = await _txnRepo.GetTopUsersAsync();
            _response.Result = result;
            return Ok(_response);
        }

        // =========================================================================
        // 🔧 HELPER
        // =========================================================================
        private int GetUserIdFromToken()
        {
            var idClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(idClaim))
            {
                idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }

            if (int.TryParse(idClaim, out int userId))
            {
                return userId;
            }
            return 0;
        }
    }
}