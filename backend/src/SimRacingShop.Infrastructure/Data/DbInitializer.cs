using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Settings;

namespace SimRacingShop.Infrastructure.Data;

public static class DbInitializer
{
    public const string AdminRole = "Admin";
    public const string UserRole = "Customer";

    public static async Task SeedAsync(
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        AdminSeedSettings adminSettings,
        ILogger logger)
    {
        await SeedRolesAsync(roleManager, logger);
        await SeedAdminUserAsync(userManager, adminSettings, logger);
    }

    private static async Task SeedRolesAsync(
        RoleManager<IdentityRole<Guid>> roleManager,
        ILogger logger)
    {
        string[] roles = [AdminRole, UserRole];

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                if (result.Succeeded)
                {
                    logger.LogInformation("Role '{Role}' created successfully", roleName);
                }
                else
                {
                    logger.LogError("Failed to create role '{Role}': {Errors}",
                        roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private static async Task SeedAdminUserAsync(
        UserManager<User> userManager,
        AdminSeedSettings settings,
        ILogger logger)
    {
        var admins = await userManager.GetUsersInRoleAsync(AdminRole);
        if (admins.Count > 0)
        {
            return;
        }

        if (string.IsNullOrEmpty(settings.Email) || string.IsNullOrEmpty(settings.Password))
        {
            throw new InvalidOperationException(
                "No admin user exists and AdminSeed settings are not configured. " +
                "Please set AdminSeed__Email and AdminSeed__Password environment variables.");
        }

        var adminUser = new User
        {
            UserName = settings.Email,
            Email = settings.Email,
            FirstName = settings.FirstName,
            LastName = settings.LastName,
            EmailConfirmed = true,
            Language = "es"
        };

        var result = await userManager.CreateAsync(adminUser, settings.Password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, AdminRole);
            logger.LogInformation("Admin user '{Email}' created successfully", settings.Email);
        }
        else
        {
            throw new InvalidOperationException(
                $"Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }
}
