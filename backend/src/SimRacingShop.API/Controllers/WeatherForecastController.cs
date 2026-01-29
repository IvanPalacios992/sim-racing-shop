using Microsoft.AspNetCore.Mvc;
using SimRacingShop.API.Models;

namespace SimRacingShop.API.Controllers;

/// <summary>
/// Weather forecast controller (ejemplo)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el pronóstico del tiempo
    /// </summary>
    /// <returns>Lista de pronósticos</returns>
    /// <response code="200">Retorna la lista de pronósticos</response>
    [HttpGet(Name = "GetWeatherForecast")]
    [ProducesResponseType(typeof(IEnumerable<WeatherForecast>), StatusCodes.Status200OK)]
    public IEnumerable<WeatherForecast> Get()
    {
        _logger.LogInformation("Getting weather forecast");

        try
        {
            var forecasts = Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();

            _logger.LogInformation("Successfully generated {Count} weather forecasts", forecasts.Length);

            return forecasts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating weather forecasts");
            throw;
        }
    }

    /// <summary>
    /// Prueba diferentes niveles de log
    /// </summary>
    /// <returns>Mensaje de confirmación</returns>
    /// <response code="200">Logs generados correctamente</response>
    [HttpGet("test-log-levels")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult TestLogLevels()
    {
        _logger.LogTrace("This is a TRACE log");
        _logger.LogDebug("This is a DEBUG log");
        _logger.LogInformation("This is an INFORMATION log");
        _logger.LogWarning("This is a WARNING log");
        _logger.LogError("This is an ERROR log");
        _logger.LogCritical("This is a CRITICAL log");

        return Ok(new { message = "Check logs for different levels" });
    }
}