using System.ComponentModel.DataAnnotations;

namespace Library.CirculationService.Models
{
    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }

        public int BookId { get; set; }
        public string BookTitle { get; set; }

        // Keep User info consistent
        public int UserId { get; set; }
        public string UserName { get; set; }

        public string Status { get; set; } // "Requested", "Issued", "ReturnPending", "Returned", "Rejected"

        public DateTime RequestedDate { get; set; } = DateTime.Now;
        public DateTime? IssueDate { get; set; }
        public DateTime? DueDate { get; set; }

        // ✅ ADD THIS MISSING PROPERTY
        public DateTime? ReturnRequestedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public bool IsFinePaid { get; set; } = true;
        public double FineAmount { get; set; } = 0.0;
    }
}
