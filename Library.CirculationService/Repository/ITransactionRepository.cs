using Library.CirculationService.Models;

namespace Library.CirculationService.Repository
{
    public interface ITransactionRepository
    {
        // User Methods
        Task<string> RequestBookAsync(int bookId, int userId, string userName, string bookTitle);
        Task<bool> CancelRequestAsync(int transactionId, int userId);
        Task<IEnumerable<Transaction>> GetUserHistoryAsync(int userId);
        Task<IEnumerable<dynamic>> GetUserNotificationsAsync(int userId);
        Task<(int Issued, int Returned, double UnpaidFines)> GetUserStatsAsync(int userId);

        // ✅ Return Request
        Task<bool> RequestReturnAsync(int userId, int bookId);

        // Admin Methods
        Task<string> ApproveRequestAsync(int transactionId);
        Task<bool> RejectRequestAsync(int transactionId);
        Task<double> ReturnBookAsync(int transactionId); // Force Return

        // ✅ Return Approval
        Task<IEnumerable<Transaction>> GetPendingReturnsAsync();
        Task<bool> ApproveReturnAsync(int transactionId);

        // Stats & Misc
        Task<IEnumerable<Transaction>> GetAllTransactionsAsync(string? status);
        Task<(int Borrowed, int Returned, int Requested)> GetStatsAsync();
        Task<IEnumerable<dynamic>> GetWeeklyStatsAsync();
        Task<string> JoinWaitlistAsync(int bookId, int userId, string bookTitle);
        Task<bool> PayFineAsync(int transactionId);
        //top user and top books
        Task<IEnumerable<dynamic>> GetTopBooksAsync();
        Task<IEnumerable<dynamic>> GetTopUsersAsync();
    }
}