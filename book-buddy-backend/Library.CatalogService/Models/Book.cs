using System.ComponentModel.DataAnnotations;

namespace Library.CatalogService.Models
{
    public class Book
    {
        [Key]
        public int BookId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Author { get; set; }

        public string ISBN { get; set; }
        public string Genre { get; set; }

        [Range(0, 1000)]
        public int TotalCopies { get; set; }

        public int AvailableCopies
        {
            get; set;
        }
        //rating 
        // Add this property to your existing class
        public double AverageRating { get; set; } = 0.0;
        //image
        public string ImageUrl { get; set; } = "https://via.placeholder.com/150"; // Default image
        public string Description { get; set; }
    }
}
