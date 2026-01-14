using Library.Shared;
using Newtonsoft.Json;

namespace Library.CirculationService.Services
{
    public class CatalogProxy : ICatalogProxy
    {
        private readonly HttpClient _httpClient;

        public CatalogProxy(HttpClient httpClient)
        {
            _httpClient = httpClient;
           
            // Base address is set in Program.cs
        }

        public async Task<BookItemDto?> GetBookAsync(int bookId)
        {
            // Call Catalog Service: GET /api/books/{id}
            var response = await _httpClient.GetAsync($"/api/books/{bookId}");

            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();

            // Deserialize the ResponseDto wrapper to get the actual Book
            var apiResponse = JsonConvert.DeserializeObject<ResponseDto>(content);

            if (apiResponse != null && apiResponse.IsSuccess)
            {
                // Convert internal JSON object to BookItemDto
                return JsonConvert.DeserializeObject<BookItemDto>(apiResponse.Result.ToString());
            }
            return null;
        }

        //public async Task<bool> UpdateStockAsync(int bookId, int quantityChange)
        //{
        //    // Call Catalog Service: PUT /api/books/update-stock/{id}/{change}
        //    // quantityChange: -1 for Issue, +1 for Return
        //    var response = await _httpClient.PutAsync($"/api/books/update-stock/{bookId}/{quantityChange}", null);
        //    return response.IsSuccessStatusCode;
        //}

        public async Task<bool> SyncStockAsync(int bookId, int change)
        {
            try
            {
                var response = await _httpClient.PutAsync($"api/books/update-stock/{bookId}?change={change}", null);

                if (!response.IsSuccessStatusCode)
                {
                    // Log the actual error from Catalog Service
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[CatalogProxy] Stock Update Failed: {response.StatusCode} - {error}");
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                // This usually means Catalog Service is offline or Port is wrong
                Console.WriteLine($"[CatalogProxy] Connection Error: {ex.Message}");
                return false;
            }
        }
    }
}
