using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class ComponentTranslationConfiguration : IEntityTypeConfiguration<ComponentTranslation>
    {
        public void Configure(EntityTypeBuilder<ComponentTranslation> builder)
        {
            builder.HasKey(ct => ct.Id);

            builder.Property(ct => ct.Locale)
                .IsRequired()
                .HasMaxLength(5);

            builder.Property(ct => ct.Name)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(ct => ct.Description)
                .HasColumnType("text");

            // Unique constraints
            builder.HasIndex(ct => new { ct.ComponentId, ct.Locale })
                .IsUnique();
        }
    }
}
