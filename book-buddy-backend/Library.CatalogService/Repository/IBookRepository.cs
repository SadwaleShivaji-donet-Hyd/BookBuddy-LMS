using Library.CatalogService.Models;
using Library.Shared;

namespace Library.CatalogService.Repository
{
    public interface IBookRepository
    {
        //Task<(IEnumerable<Book>, int)> GetAllBooks(int page, int pageSize);
        //Task<IEnumerable<Book>> GetAllBooks();
        Task<(IEnumerable<Book> Books, int TotalCount)> GetAllBooksAsync(string? genre, string? search, int page, int pageSize); Task<Book> GetBookById(int id);
        Task<Book> CreateBook(Book book);
        Task<Book> UpdateBook(Book book);
        Task<bool> DeleteBook(int id);

        // Special method for Circulation Service to adjust stock
        //Task<bool> UpdateStock(int bookId, int changeAmount);
        Task<bool> UpdateStockAsync(int bookId, int change);
        //review
        Task<bool> AddReviewAsync(BookReview review);
        Task<IEnumerable<ReviewResultDto>> GetReviewsAsync(int bookId);
    }
}
