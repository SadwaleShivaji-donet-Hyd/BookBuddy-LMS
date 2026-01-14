using Library.CatalogService.Data;
using Library.CatalogService.Models;
using Library.Shared;
using Microsoft.EntityFrameworkCore;
namespace Library.CatalogService.Repository
{
    public class BookRepository:IBookRepository
    {
        private readonly CatalogDbContext _db;

        public BookRepository(CatalogDbContext db)
        {
            _db = db;
        }

        public async Task<(IEnumerable<Book> Books, int TotalCount)> GetAllBooksAsync(string? genre, string? search, int page, int pageSize)
        {
            var query = _db.Books.AsQueryable();

            // ✅ 1. Filter by Genre (Updated for 'Other')
            if (!string.IsNullOrEmpty(genre) && genre != "All")
            {
                if (genre == "Other")
                {
                    // Define the standard categories you display on the UI
                    var standardGenres = new List<string>
            {
                "Fiction", "Non-Fiction", "Sci-Fi", "Technology",
                "History", "Mystery", "Biography", "Fantasy"
            };

                    // Return books that do NOT belong to the standard list
                    query = query.Where(b => !standardGenres.Contains(b.Genre));
                }
                else
                {
                    // Standard filtering for specific genres
                    query = query.Where(b => b.Genre == genre);
                }
            }

            // 2. Filter by Search (Title or Author)
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search) );
            }

            // 3. Get Total Count
            var totalCount = await query.CountAsync();

            // 4. Pagination
            var books = await query
                .OrderByDescending(b => b.BookId) // Recommended: Order by ID to ensure stable pagination
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (books, totalCount);
        }
        public async Task<Book> GetBookById(int id)
        {
            return await _db.Books.FindAsync(id);
        }

        public async Task<Book> CreateBook(Book book)
        {
            // Initially, Available copies = Total copies
            book.AvailableCopies = book.TotalCopies;
            _db.Books.Add(book);
            await _db.SaveChangesAsync();
            return book;
        }

        public async Task<Book> UpdateBook(Book book)
        {
            // 1. Fetch the existing book from DB to see current values
            var existingBook = await _db.Books.FindAsync(book.BookId);

            if (existingBook != null)
            {
                // 2. Calculate how many copies were added or removed
                int stockDifference = book.TotalCopies - existingBook.TotalCopies;

                // 3. Update basic fields
                existingBook.Title = book.Title;
                existingBook.Author = book.Author;
                existingBook.ISBN = book.ISBN;
                existingBook.Genre = book.Genre;
                existingBook.TotalCopies = book.TotalCopies;

                // ✅ FIX: Update the ImageUrl and Description
                existingBook.ImageUrl = book.ImageUrl;
                existingBook.Description = book.Description;

                // 4. Smart Update for Availability
                // If you added 5 books (stockDiff = +5), we add 5 to Available.
                // If you removed 2 books (stockDiff = -2), we subtract 2.
                existingBook.AvailableCopies += stockDifference;

                // Safety: Ensure it never drops below zero
                if (existingBook.AvailableCopies < 0) existingBook.AvailableCopies = 0;

                // 5. Save Changes
                _db.Books.Update(existingBook);
                await _db.SaveChangesAsync();
                return existingBook;
            }
            return null;
        }

        public async Task<bool> DeleteBook(int id)
        {
            var book = await _db.Books.FindAsync(id);
            if (book == null) return false;

            _db.Books.Remove(book);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStockAsync(int bookId, int change)
        {
            var book = await _db.Books.FindAsync(bookId);
            if (book == null) return false;

            // Check if we have enough stock to decrease
            if (book.AvailableCopies + change < 0)
            {
                return false; // Not enough stock
            }

            book.AvailableCopies += change;

            _db.Books.Update(book);
            await _db.SaveChangesAsync();
            return true;
        }
        //review component
        public async Task<bool> AddReviewAsync(BookReview review)
        {
            try
            {
                // A. Add the review
                await _db.BookReviews.AddAsync(review);

                // B. Find the book to update its average
                var book = await _db.Books.FirstOrDefaultAsync(b => b.BookId == review.BookId);
                if (book != null)
                {
                    // Calculate new average efficiently
                    // (Current Sum + New Rating) / (Count + 1)
                    var currentReviews = _db.BookReviews.Where(r => r.BookId == review.BookId).ToList();
                    double newAverage = currentReviews.Any()
                        ? currentReviews.Average(r => r.Rating)
                        : review.Rating;

                    // Update Book Table
                    book.AverageRating = Math.Round(newAverage, 1);
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        // ✅ 2. GET REVIEWS FOR A BOOK
        public async Task<IEnumerable<ReviewResultDto>> GetReviewsAsync(int bookId)
        {
            var reviews = await _db.BookReviews
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.DatePosted) // Newest first
                .Select(r => new ReviewResultDto
                {
                    Id = r.Id,
                    UserName = r.UserName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    DatePosted = r.DatePosted.ToString("MMM dd, yyyy") // e.g., "Dec 15, 2025"
                })
                .ToListAsync();

            return reviews;
        }
    }
}
