using Library.CirculationService.Data;
using Library.CirculationService.Models;
using Library.CirculationService.Services;
using Library.Shared;
using Microsoft.EntityFrameworkCore;

namespace Library.CirculationService.Repository
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly CirculationDbContext _db;
        private readonly ICatalogProxy _catalogService;

        public TransactionRepository(CirculationDbContext db, ICatalogProxy catalogService)
        {
            _db = db;
            _catalogService = catalogService;
        }

        // =========================================================================
        // 👤 USER METHODS
        // =========================================================================

        public async Task<string> RequestBookAsync(int bookId, int userId, string userName, string bookTitle)
        {
            // 1. Check Limits (Max 3 active books/requests)
            var activeCount = await _db.Transactions.CountAsync(t =>
                t.UserId == userId &&
                (t.Status == "Requested" || t.Status == "Issued" || t.Status == "ReturnPending"));

            if (activeCount >= 3) return "Limit Reached: You cannot hold more than 3 items.";

            // 2. Check Duplicate Request
            var existing = await _db.Transactions.FirstOrDefaultAsync(t =>
                t.UserId == userId && t.BookId == bookId &&
                (t.Status == "Requested" || t.Status == "Issued" || t.Status == "ReturnPending"));

            if (existing != null) return "You have already requested or hold this book.";

            // 3. Create Request
            var transaction = new Transaction
            {
                BookId = bookId,
                UserId = userId,
                UserName = userName,
                BookTitle = bookTitle,
                Status = "Requested",
                RequestedDate = DateTime.Now,
                IsFinePaid = true
            };

            _db.Transactions.Add(transaction);

            // =================================================================
            // 4. ✅ CLEANUP: Remove from Waitlist
            // This removes the "Back in Stock" notification since the user has acted on it.
            // =================================================================
            var waitlistEntry = await _db.Waitlist
                .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);

            if (waitlistEntry != null)
            {
                _db.Waitlist.Remove(waitlistEntry);
            }

            await _db.SaveChangesAsync();
            return "Success";
        }

        public async Task<bool> CancelRequestAsync(int transactionId, int userId)
        {
            var trans = await _db.Transactions.FirstOrDefaultAsync(t => t.TransactionId == transactionId && t.UserId == userId && t.Status == "Requested");
            if (trans == null) return false;

            _db.Transactions.Remove(trans);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Transaction>> GetUserHistoryAsync(int userId)
        {
            return await _db.Transactions
                            .Where(t => t.UserId == userId)
                            .OrderByDescending(t => t.RequestedDate)
                            .ToListAsync();
        }

        public async Task<IEnumerable<dynamic>> GetUserNotificationsAsync(int userId)
        {
            return await _db.Waitlist
                .Where(w => w.UserId == userId && w.IsNotified)
                .Select(w => new
                {
                    w.Id,
                    w.BookTitle,
                    w.BookId,
                    Message = $"Great news! '{w.BookTitle}' is now back in stock."
                })
                .ToListAsync();
        }

        public async Task<(int Issued, int Returned, double UnpaidFines)> GetUserStatsAsync(int userId)
        {
            var issued = await _db.Transactions.CountAsync(t => t.UserId == userId && t.Status == "Issued");
            var returned = await _db.Transactions.CountAsync(t => t.UserId == userId && t.Status == "Returned");
            var fines = await _db.Transactions.Where(t => t.UserId == userId && !t.IsFinePaid).SumAsync(t => t.FineAmount);
            return (issued, returned, fines);
        }

        // ✅ LOGIC: User requests a return
        public async Task<bool> RequestReturnAsync(int userId, int bookId)
        {
            // Find the transaction in Transactions table
            var transaction = await _db.Transactions.FirstOrDefaultAsync(x =>
                x.BookId == bookId &&
                x.UserId == userId &&
                x.Status == "Issued");

            if (transaction == null) return false;

            transaction.Status = "ReturnPending";
            transaction.ReturnRequestedDate = DateTime.Now; // ✅ Now valid due to model update

            _db.Transactions.Update(transaction);
            await _db.SaveChangesAsync();
            return true;
        }

        // =========================================================================
        // 👮 ADMIN METHODS
        // =========================================================================

        public async Task<string> ApproveRequestAsync(int transactionId)
        {
            var trans = await _db.Transactions.FindAsync(transactionId);
            if (trans == null || trans.Status != "Requested")
                return "Transaction not found or invalid status.";

            // Sync Inventory (-1)
            bool stockUpdated = await _catalogService.SyncStockAsync(trans.BookId, -1);
            if (!stockUpdated) return "Failed: Book is out of stock (or Catalog Service is down).";

            trans.Status = "Issued";
            trans.IssueDate = DateTime.Now;
            trans.DueDate = DateTime.Now.AddDays(7);

            _db.Transactions.Update(trans);
            await _db.SaveChangesAsync();
            return "Success";
        }

        public async Task<bool> RejectRequestAsync(int transactionId)
        {
            var transaction = await _db.Transactions.FindAsync(transactionId);
            if (transaction == null || transaction.Status != "Requested") return false;

            transaction.Status = "Rejected";
            await _db.SaveChangesAsync();
            return true;
        }

        // Force Return (Manual)
        public async Task<double> ReturnBookAsync(int transactionId)
        {
            var trans = await _db.Transactions.FindAsync(transactionId);
            if (trans == null || trans.Status != "Issued") return -1;

            return await ProcessReturnInternal(trans);
        }

        // ✅ LOGIC: Get all pending returns for Admin Dashboard
        public async Task<IEnumerable<Transaction>> GetPendingReturnsAsync()
        {
            return await _db.Transactions
                .Where(x => x.Status == "ReturnPending")
                .OrderBy(x => x.ReturnRequestedDate)
                .ToListAsync();
        }

        // ✅ LOGIC: Approve the return request
        public async Task<bool> ApproveReturnAsync(int transactionId)
        {
            var trans = await _db.Transactions.FindAsync(transactionId);
            if (trans == null) return false;

            await ProcessReturnInternal(trans);
            return true;
        }

        // Helper to handle stock + fine logic (used by both Force Return and Approve Return)
        private async Task<double> ProcessReturnInternal(Transaction trans)
        {
            // 1. Sync Inventory (+1)
            await _catalogService.SyncStockAsync(trans.BookId, 1);

            // 2. Check Waitlist
            var waiter = await _db.Waitlist
                .Where(w => w.BookId == trans.BookId && !w.IsNotified)
                .OrderBy(w => w.RequestDate)
                .FirstOrDefaultAsync();

            if (waiter != null)
            {
                waiter.IsNotified = true;
                // In real app, send email here
            }

            // 3. Update Status
            trans.Status = "Returned";
            trans.ReturnDate = DateTime.Now;

            // 4. Calculate Fine
            double fine = 0;
            if (trans.DueDate.HasValue && trans.ReturnDate > trans.DueDate)
            {
                var daysLate = (trans.ReturnDate.Value.Date - trans.DueDate.Value.Date).Days;
                if (daysLate > 0) fine = daysLate * 1.0;
            }

            trans.FineAmount = fine;
            trans.IsFinePaid = (fine == 0);

            _db.Transactions.Update(trans);
            await _db.SaveChangesAsync();
            return fine;
        }

        public async Task<bool> PayFineAsync(int transactionId)
        {
            var trans = await _db.Transactions.FindAsync(transactionId);
            if (trans == null || trans.Status != "Returned" || trans.IsFinePaid) return false;

            trans.IsFinePaid = true;
            trans.FineAmount = 0;
            _db.Transactions.Update(trans);
            await _db.SaveChangesAsync();
            return true;
        }

        // =========================================================================
        // 📊 STATS & MISC
        // =========================================================================

        public async Task<IEnumerable<Transaction>> GetAllTransactionsAsync(string? status)
        {
            var query = _db.Transactions.AsQueryable();
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                query = query.Where(t => t.Status.ToLower() == status.ToLower());
            }
            return await query.OrderByDescending(t => t.RequestedDate).ToListAsync();
        }

        public async Task<(int Borrowed, int Returned, int Requested)> GetStatsAsync()
        {
            var borrowed = await _db.Transactions.CountAsync(t => t.Status == "Issued");
            var returned = await _db.Transactions.CountAsync(t => t.Status == "Returned");
            var requested = await _db.Transactions.CountAsync(t => t.Status == "Requested");
            return (borrowed, returned, requested);
        }

        public async Task<IEnumerable<dynamic>> GetWeeklyStatsAsync()
        {
            var sevenDaysAgo = DateTime.Now.AddDays(-6).Date;
            var data = await _db.Transactions
                .Where(t => t.RequestedDate >= sevenDaysAgo)
                .GroupBy(t => t.RequestedDate.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(x => x.Date)
                .ToListAsync();
            return data;
        }

        public async Task<string> JoinWaitlistAsync(int bookId, int userId, string bookTitle)
        {
            var exists = await _db.Waitlist.AnyAsync(w => w.BookId == bookId && w.UserId == userId && !w.IsNotified);
            if (exists) return "You are already on the waitlist.";

            var entry = new WaitlistEntry
            {
                BookId = bookId,
                UserId = userId,
                BookTitle = bookTitle,
                RequestDate = DateTime.Now,
                IsNotified = false
            };
            _db.Waitlist.Add(entry);
            await _db.SaveChangesAsync();
            return "Success";
        }
        //top user and books
        // 1. Get Top 5 Books
        public async Task<IEnumerable<dynamic>> GetTopBooksAsync()
        {
            return await _db.Transactions
                .GroupBy(t => new { t.BookId, t.BookTitle }) // Group by Book
                .Select(g => new
                {
                    Title = g.Key.BookTitle,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();
        }

        // 2. Get Top 5 Users
        public async Task<IEnumerable<dynamic>> GetTopUsersAsync()
        {
            return await _db.Transactions
                .GroupBy(t => new { t.UserId, t.UserName }) // Group by User
                .Select(g => new
                {
                    Name = g.Key.UserName,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();
        }
    }
}