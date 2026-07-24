using Microsoft.EntityFrameworkCore;
using QueueMate.Api.Models;
using QueueMate.Api.Models.Common;

namespace QueueMate.Api.Data;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Business> Businesses => Set<Business>();

    public DbSet<BusinessMember> BusinessMembers => Set<BusinessMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureBusiness(modelBuilder);
        ConfigureBusinessMember(modelBuilder);
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<User>();

        entity.ToTable("users");

        entity.HasKey(user => user.Id);

        entity.Property(user => user.FullName)
            .HasMaxLength(120)
            .IsRequired();

        entity.Property(user => user.Email)
            .HasMaxLength(255)
            .IsRequired();

        entity.Property(user => user.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        entity.HasIndex(user => user.Email)
            .IsUnique();
    }

    private static void ConfigureBusiness(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Business>();

        entity.ToTable("businesses");

        entity.HasKey(business => business.Id);

        entity.Property(business => business.Name)
            .HasMaxLength(150)
            .IsRequired();

        entity.Property(business => business.Slug)
            .HasMaxLength(160)
            .IsRequired();

        entity.Property(business => business.Category)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(business => business.Phone)
            .HasMaxLength(30);

        entity.Property(business => business.Email)
            .HasMaxLength(255);

        entity.Property(business => business.Address)
            .HasMaxLength(500);

        entity.Property(business => business.TimeZone)
            .HasMaxLength(100)
            .IsRequired();

        entity.HasIndex(business => business.Slug)
            .IsUnique();
    }

    private static void ConfigureBusinessMember(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<BusinessMember>();

        entity.ToTable("business_members");

        entity.HasKey(member => member.Id);

        entity.Property(member => member.Role)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        entity.HasIndex(member => new
        {
            member.UserId,
            member.BusinessId
        }).IsUnique();

        entity.HasOne(member => member.User)
            .WithMany(user => user.BusinessMemberships)
            .HasForeignKey(member => member.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(member => member.Business)
            .WithMany(business => business.Members)
            .HasForeignKey(member => member.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();

        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var modifiedEntities = ChangeTracker
            .Entries<BaseEntity>()
            .Where(entry => entry.State == EntityState.Modified);

        foreach (var entry in modifiedEntities)
        {
            entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}