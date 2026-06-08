using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<PasswordHistory> PasswordHistories => Set<PasswordHistory>();

    public DbSet<PasswordResetOtp> PasswordResetOtps => Set<PasswordResetOtp>();

    public DbSet<SessionToken> SessionTokens => Set<SessionToken>();

    public DbSet<AuthAuditEvent> AuthAuditEvents => Set<AuthAuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(x => x.Username).IsUnique();
            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<PasswordHistory>(entity =>
        {
            entity.ToTable("password_histories");
            entity.HasOne(x => x.User)
                .WithMany(u => u.PasswordHistories)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PasswordResetOtp>(entity =>
        {
            entity.ToTable("password_reset_otps");
            entity.HasOne(x => x.User)
                .WithMany(u => u.PasswordResetOtps)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SessionToken>(entity =>
        {
            entity.ToTable("session_tokens");
            entity.HasIndex(x => x.TokenId).IsUnique();
            entity.HasOne(x => x.User)
                .WithMany(u => u.SessionTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuthAuditEvent>(entity =>
        {
            entity.ToTable("auth_audit_events");
            entity.HasIndex(x => x.TimestampUtc);
            entity.HasIndex(x => x.Username);
        });
    }
}
