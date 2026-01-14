using Microsoft.EntityFrameworkCore;
using Library.CirculationService.Models;
using Library.Shared;
namespace Library.CirculationService.Data
{
    public class CirculationDbContext:DbContext
    {
        public CirculationDbContext(DbContextOptions<CirculationDbContext> options) : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<WaitlistEntry> Waitlist { get; set; }
        public DbSet<BookIssue> BookIssues { get; set; }
    }
}
