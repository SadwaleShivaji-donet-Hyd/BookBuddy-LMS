using Library.CatalogService.Models;
using Library.CatalogService.Repository;
using Library.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Library.CatalogService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookRepository _bookRepo;
        protected ResponseDto _response;

        public BooksController(IBookRepository bookRepo)
        {
            _bookRepo = bookRepo;
            _response = new ResponseDto();
        }

        [HttpGet]
        public async Task<ResponseDto> GetAllBooks(
     [FromQuery] string? genre,
     [FromQuery] string? search,  // ✅ New Parameter
     [FromQuery] int page = 1,
     [FromQuery] int limit = 6)
        {
            try
            {
                // Pass search to repo
                var (books, totalCount) = await _bookRepo.GetAllBooksAsync(genre, search, page, limit);

                _response.Result = new
                {
                    Items = books,
                    TotalCount = totalCount,
                    Page = page,
                    TotalPages = (int)Math.Ceiling((double)totalCount / limit)
                };
                _response.DisplayMessage = "Success";
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpGet("{id}")]
        public async Task<object> Get(int id)
        {
            try
            {
                var book = await _bookRepo.GetBookById(id);
                if (book == null)
                {
                    _response.IsSuccess = false;
                    _response.DisplayMessage = "Book not found";
                    return NotFound(_response);
                }
                _response.Result = book;
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Only Admin can add books
        public async Task<object> Post([FromBody] Book bookDto)
        {
            try
            {
                _response.Result = await _bookRepo.CreateBook(bookDto);
                _response.DisplayMessage = "Book Created Successfully";
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<object> Put([FromBody] Book bookDto)
        {
            try
            {
                _response.Result = await _bookRepo.UpdateBook(bookDto);
                _response.DisplayMessage = "Book Updated Successfully";
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<object> Delete(int id)
        {
            try
            {
                bool isDeleted = await _bookRepo.DeleteBook(id);
                if (isDeleted)
                {
                    _response.Result = isDeleted;
                    _response.DisplayMessage = "Book Deleted Successfully";
                }
                else
                {
                    _response.IsSuccess = false;
                    _response.DisplayMessage = "Book not found";
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        // Internal API for Circulation Service to call (Secured)
        [HttpPut("update-stock/{bookId}")]
        public async Task<IActionResult> UpdateStock(int bookId, [FromQuery] int change)
        {
            // Call Repository instead of DbContext
            bool success = await _bookRepo.UpdateStockAsync(bookId, change);

            if (!success)
            {
                return BadRequest(new { isSuccess = false, displayMessage = "Update failed. Book not found or insufficient stock." });
            }

            return Ok(new { isSuccess = true });
        }
        //reviews
        // ✅ POST: Add a Review
        [HttpPost("review")]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] AddReviewDto model)
        {
            // ✅ FIX: Check for 'sub' OR 'NameIdentifier' (because .NET renames claims)
            var userId = User.Claims.FirstOrDefault(c =>
                c.Type == "sub" ||
                c.Type == System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            var userName = User.Identity?.Name ?? "Anonymous";

            if (string.IsNullOrEmpty(userId))
            {
                // Log this to see if it's actually failing here
                Console.WriteLine("User ID claim not found in token.");
                return Unauthorized();
            }

            var review = new BookReview
            {
                BookId = model.BookId,
                Rating = model.Rating,
                Comment = model.Comment,
                UserId = userId,
                UserName = userName,
                DatePosted = DateTime.Now
            };

            bool success = await _bookRepo.AddReviewAsync(review);

            if (!success)
            {
                _response.IsSuccess = false;
                _response.DisplayMessage = "Failed to add review.";
                return BadRequest(_response);
            }

            _response.DisplayMessage = "Review added successfully!";
            return Ok(_response);
        }

        // ✅ GET: View Reviews
        [HttpGet("{bookId}/reviews")]
        public async Task<IActionResult> GetReviews(int bookId)
        {
            var reviews = await _bookRepo.GetReviewsAsync(bookId);
            _response.Result = reviews;
            return Ok(_response);
        }
    }
}
