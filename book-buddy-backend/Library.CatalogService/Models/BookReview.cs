using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Library.CatalogService.Models
{
    public class BookReview
    {
        [Key]
        public int Id { get; set; }

        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; }

        public string UserId { get; set; } // Stores GUID from Identity
        public string UserName { get; set; } // "Pavan"

        [Range(1, 5)]
        public int Rating { get; set; } // 1 to 5 Stars

        public string Comment { get; set; }

        public DateTime DatePosted { get; set; } = DateTime.Now;
    }
}
