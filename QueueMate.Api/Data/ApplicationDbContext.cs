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
    
    public DbSet<Service> Services => Set<Service>();
    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();

    public DbSet<StaffService> StaffServices => Set<StaffService>();
    public DbSet<BusinessWorkingHour> BusinessWorkingHours
    => Set<BusinessWorkingHour>();

   public DbSet<StaffWorkingHour> StaffWorkingHours
    => Set<StaffWorkingHour>();

   public DbSet<StaffTimeOff> StaffTimeOffEntries
    => Set<StaffTimeOff>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureBusiness(modelBuilder);
        ConfigureBusinessMember(modelBuilder);
        ConfigureService(modelBuilder);
        ConfigureStaffMember(modelBuilder);
        ConfigureStaffService(modelBuilder);
        ConfigureBusinessWorkingHour(modelBuilder);
        ConfigureStaffWorkingHour(modelBuilder);
        ConfigureStaffTimeOff(modelBuilder);
    }
    
    private static void ConfigureService(ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<Service>();

    entity.ToTable("services");

    entity.HasKey(service => service.Id);

    entity.Property(service => service.Name)
        .HasMaxLength(120)
        .IsRequired();

    entity.Property(service => service.Description)
        .HasMaxLength(500);

    entity.Property(service => service.DurationMinutes)
        .IsRequired();

    entity.Property(service => service.Price)
        .HasPrecision(12, 2)
        .IsRequired();

    entity.HasIndex(service => new
    {
        service.BusinessId,
        service.Name
    }).IsUnique();

    entity.HasOne(service => service.Business)
        .WithMany(business => business.Services)
        .HasForeignKey(service => service.BusinessId)
        .OnDelete(DeleteBehavior.Cascade);
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
    private static void ConfigureStaffMember(ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<StaffMember>();

    entity.ToTable("staff_members");

    entity.HasKey(staff => staff.Id);

    entity.Property(staff => staff.FullName)
        .HasMaxLength(120)
        .IsRequired();

    entity.Property(staff => staff.Email)
        .HasMaxLength(255);

    entity.Property(staff => staff.Phone)
        .HasMaxLength(30);

    entity.Property(staff => staff.JobTitle)
        .HasMaxLength(100);

    entity.HasIndex(staff => new
    {
        staff.BusinessId,
        staff.Email
    });

    entity.HasOne(staff => staff.Business)
        .WithMany(business => business.StaffMembers)
        .HasForeignKey(staff => staff.BusinessId)
        .OnDelete(DeleteBehavior.Cascade);
}

private static void ConfigureStaffService(ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<StaffService>();

    entity.ToTable("staff_services");

    entity.HasKey(mapping => mapping.Id);

    entity.HasIndex(mapping => new
    {
        mapping.StaffMemberId,
        mapping.ServiceId
    }).IsUnique();

    entity.HasOne(mapping => mapping.StaffMember)
        .WithMany(staff => staff.StaffServices)
        .HasForeignKey(mapping => mapping.StaffMemberId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(mapping => mapping.Service)
        .WithMany(service => service.StaffServices)
        .HasForeignKey(mapping => mapping.ServiceId)
        .OnDelete(DeleteBehavior.Cascade);
}
private static void ConfigureBusinessWorkingHour(
    ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<BusinessWorkingHour>();

    entity.ToTable("business_working_hours");

    entity.HasKey(item => item.Id);

    entity.Property(item => item.OpeningTime)
        .HasColumnType("time");

    entity.Property(item => item.ClosingTime)
        .HasColumnType("time");

    entity.HasIndex(item => new
    {
        item.BusinessId,
        item.DayOfWeek
    }).IsUnique();

    entity.HasOne(item => item.Business)
        .WithMany(business => business.WorkingHours)
        .HasForeignKey(item => item.BusinessId)
        .OnDelete(DeleteBehavior.Cascade);
}

private static void ConfigureStaffWorkingHour(
    ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<StaffWorkingHour>();

    entity.ToTable("staff_working_hours");

    entity.HasKey(item => item.Id);

    entity.Property(item => item.StartTime)
        .HasColumnType("time");

    entity.Property(item => item.EndTime)
        .HasColumnType("time");

    entity.HasIndex(item => new
    {
        item.StaffMemberId,
        item.DayOfWeek
    }).IsUnique();

    entity.HasOne(item => item.StaffMember)
        .WithMany(staff => staff.WorkingHours)
        .HasForeignKey(item => item.StaffMemberId)
        .OnDelete(DeleteBehavior.Cascade);
}

private static void ConfigureStaffTimeOff(
    ModelBuilder modelBuilder)
{
    var entity = modelBuilder.Entity<StaffTimeOff>();

    entity.ToTable("staff_time_off");

    entity.HasKey(item => item.Id);

    entity.Property(item => item.Reason)
        .HasMaxLength(300);

    entity.HasIndex(item => new
    {
        item.StaffMemberId,
        item.StartDateTimeUtc,
        item.EndDateTimeUtc
    });

    entity.HasOne(item => item.StaffMember)
        .WithMany(staff => staff.TimeOffEntries)
        .HasForeignKey(item => item.StaffMemberId)
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