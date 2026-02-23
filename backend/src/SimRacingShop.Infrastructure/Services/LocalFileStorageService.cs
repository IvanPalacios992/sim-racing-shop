using Microsoft.AspNetCore.Hosting;
using SimRacingShop.Core.Services;

namespace SimRacingShop.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _webRootPath;

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

        public LocalFileStorageService(IWebHostEnvironment environment)
        {
            _webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string subdirectory)
        {
            var extension = Path.GetExtension(fileName);

            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Tipo de archivo no permitido: {extension}. Permitidos: {string.Join(", ", AllowedExtensions)}");
            }

            if (fileStream.Length > MaxFileSizeBytes)
            {
                throw new ArgumentException($"El archivo excede el tamaño máximo permitido de {MaxFileSizeBytes / (1024 * 1024)} MB");
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var directoryPath = Path.Combine(_webRootPath, "uploads", subdirectory);
            Directory.CreateDirectory(directoryPath);

            var filePath = Path.Combine(directoryPath, uniqueFileName);

            using var outputStream = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(outputStream);

            return $"/uploads/{subdirectory}/{uniqueFileName}";
        }

        public Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return Task.CompletedTask;

            var filePath = Path.Combine(_webRootPath, fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            return Task.CompletedTask;
        }
    }
}
