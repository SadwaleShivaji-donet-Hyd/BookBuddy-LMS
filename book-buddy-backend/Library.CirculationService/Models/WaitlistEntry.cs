using System.ComponentModel.DataAnnotations;

namespace Library.CirculationService.Models
{
    public class WaitlistEntry
    {
        [Key]
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public int UserId { get; set; }
        public DateTime RequestDate { get; set; }
        public bool IsNotified { get; set; } // True if stock arrived and user was alerted
    }
}
