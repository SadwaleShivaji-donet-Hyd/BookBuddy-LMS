using Library.CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace Library.CatalogService.Data
{
    public class CatalogDbContext: DbContext
    {
        public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<BookReview> BookReviews { get; set; }
    }
}
