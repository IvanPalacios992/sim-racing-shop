namespace SimRacingShop.Core.Services
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName, string subdirectory);
        Task DeleteFileAsync(string fileUrl);
    }
}
