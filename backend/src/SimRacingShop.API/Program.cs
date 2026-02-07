
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using Serilog.Events;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Settings;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Repositories;
using SimRacingShop.Infrastructure.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

// Bootstrap logger (usado antes de leer configuraci�n)
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();
try
{

    var builder = WebApplication.CreateBuilder(args);

    Log.Information("Starting SimRacing Shop API");

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(
            path: "logs/log-.txt",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 7,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        )
    );

    // Database
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    // ============================================
    // IDENTITY
    // ============================================

    builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
    {
        // Password settings
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 8;

        // Lockout settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;

        // User settings
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = false; // Cambiar a true en producci�n
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    // Configurar duración de tokens de Identity (24 horas para reset de contraseña)
    builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
    {
        options.TokenLifespan = TimeSpan.FromHours(24);
    });

    // ============================================
    // JWT AUTHENTICATION
    // ============================================

    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings!.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret)
            ),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();

                var userIdClaim = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)
                    ?? context.Principal?.FindFirst(ClaimTypes.NameIdentifier);
                var securityStampClaim = context.Principal?.FindFirst("security_stamp");

                if (userIdClaim == null || securityStampClaim == null)
                {
                    context.Fail("Token inválido: faltan claims requeridos");
                    return;
                }

                if (!Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    context.Fail("Token inválido: userId no válido");
                    return;
                }

                var isValid = await authService.ValidateSecurityStampAsync(userId, securityStampClaim.Value);
                if (!isValid)
                {
                    context.Fail("Token revocado");
                }
            }
        };
    });

    builder.Services.AddAuthorization();

    // ============================================
    // EMAIL SERVICE (Resend)
    // ============================================

    builder.Services.Configure<ResendSettings>(builder.Configuration.GetSection("ResendSettings"));
    builder.Services.AddOptions();
    builder.Services.AddHttpClient<Resend.IResend, Resend.ResendClient>();
    builder.Services.AddScoped<IEmailService, ResendEmailService>();

    // Add services to the container.
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IProductRepository, ProductRepository>();
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Version = "v1",
            Title = "SimRacing Shop API",
            Description = "API para tienda de hardware de sim racing personalizado",
            Contact = new OpenApiContact
            {
                Name = "SimRacing Shop",
                Email = "contact@simracingshop.com"
            }
        });

        // Soporte para XML comments
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
        // Configuraci�n para JWT (lo necesitar�s despu�s)
        options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT Authorization header using the Bearer scheme."
        });

        options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("bearer", document)] = []
        });
    });

    //Cors for localhost
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: "Development",
                          policy =>
                          {
                              policy.WithOrigins("http://localhost:3000") // Trusted origins
                                    .AllowAnyHeader()
                                    .AllowAnyMethod()
                                    .AllowCredentials(); // Include if using cookies/credentials
                          });
    });

    var app = builder.Build();

    // Serilog Request Logging (debe ir temprano en el pipeline)
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.GetLevel = (httpContext, elapsed, ex) =>
        {
            if (ex != null) return LogEventLevel.Error;
            if (httpContext.Response.StatusCode > 499) return LogEventLevel.Error;
            if (httpContext.Response.StatusCode > 399) return LogEventLevel.Warning;
            return LogEventLevel.Information;
        };
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
        };
    });

    // Configure the HTTP request pipeline.
    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger(options =>
        {
            options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_1;
        });
        app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "SimRacing Shop API v1");
                options.RoutePrefix = "swagger"; // URL: /swagger
                options.DocumentTitle = "SimRacing Shop API";

                // Opciones de UI
                options.DisplayRequestDuration();
                options.EnableTryItOutByDefault();
            });

        app.UseCors("Development");
    }

    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // Seed database
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        var adminSettings = builder.Configuration.GetSection("AdminSeed").Get<AdminSeedSettings>() ?? new AdminSeedSettings();

        await DbInitializer.SeedAsync(userManager, roleManager, adminSettings, logger);
    }

    // Log startup
    Log.Information("SimRacing Shop API started successfully");

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}