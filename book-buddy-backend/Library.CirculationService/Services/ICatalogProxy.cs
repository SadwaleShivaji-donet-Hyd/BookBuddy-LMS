using Library.Shared;

namespace Library.CirculationService.Services
{
    public interface ICatalogProxy
    {
        Task<BookItemDto?> GetBookAsync(int bookId);
        //Task<bool> UpdateStockAsync(int bookId, int quantityChange);
        Task<bool> SyncStockAsync(int bookId, int change);
    }
}
