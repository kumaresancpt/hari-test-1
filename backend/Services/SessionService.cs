using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class SessionService : ISessionService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public SessionService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<(string Token, DateTime ExpiresAt, string TokenId)> CreateSessionAsync(User user, CancellationToken cancellationToken)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey not configured");
        var issuer = _configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("JwtSettings:Issuer not configured");
        var expiryMinutes = _configuration.GetValue<int?>("JwtSettings:ExpiryMinutes") ?? 30;

        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(expiryMinutes);
        var tokenId = Guid.NewGuid().ToString("N");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Username),
            new(JwtRegisteredClaimNames.Jti, tokenId),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var jwtToken = new JwtSecurityToken(
            issuer,
            issuer,
            claims,
            expires: expiresAt,
            signingCredentials: creds);

        var token = new JwtSecurityTokenHandler().WriteToken(jwtToken);

        _dbContext.SessionTokens.Add(new SessionToken
        {
            UserId = user.Id,
            TokenId = tokenId,
            ExpiresAt = expiresAt,
            LastActivityAt = now,
            IsRevoked = false,
            CreatedAt = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return (token, expiresAt, tokenId);
    }

    public async Task<(bool IsActive, bool ShowWarning, int MinutesUntilExpiry)> GetSessionStatusAsync(string tokenId, CancellationToken cancellationToken)
    {
        var session = await _dbContext.SessionTokens
            .FirstOrDefaultAsync(x => x.TokenId == tokenId, cancellationToken);

        if (session is null || session.IsRevoked)
        {
            return (false, false, 0);
        }

        var idleTimeout = _configuration.GetValue<int?>("SessionSettings:IdleTimeoutMinutes") ?? 30;
        var warningBeforeExpiry = _configuration.GetValue<int?>("SessionSettings:WarningBeforeExpiryMinutes") ?? 5;
        var now = DateTime.UtcNow;
        var expiry = session.LastActivityAt.AddMinutes(idleTimeout);
        var remainingMinutes = (int)Math.Floor((expiry - now).TotalMinutes);

        if (remainingMinutes <= 0 || session.ExpiresAt <= now)
        {
            session.IsRevoked = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return (false, false, 0);
        }

        var showWarning = remainingMinutes <= warningBeforeExpiry;
        return (true, showWarning, remainingMinutes);
    }

    public async Task<bool> IsSessionActiveAsync(string tokenId, CancellationToken cancellationToken)
    {
        var status = await GetSessionStatusAsync(tokenId, cancellationToken);
        return status.IsActive;
    }

    public async Task TouchSessionAsync(string tokenId, CancellationToken cancellationToken)
    {
        var session = await _dbContext.SessionTokens
            .FirstOrDefaultAsync(x => x.TokenId == tokenId && !x.IsRevoked, cancellationToken);

        if (session is null)
        {
            return;
        }

        session.LastActivityAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task InvalidateSessionAsync(string tokenId, CancellationToken cancellationToken)
    {
        var session = await _dbContext.SessionTokens
            .FirstOrDefaultAsync(x => x.TokenId == tokenId, cancellationToken);

        if (session is null)
        {
            return;
        }

        session.IsRevoked = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task InvalidateAllSessionsForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sessions = await _dbContext.SessionTokens
            .Where(x => x.UserId == userId && !x.IsRevoked)
            .ToListAsync(cancellationToken);

        if (sessions.Count == 0)
        {
            return;
        }

        foreach (var session in sessions)
        {
            session.IsRevoked = true;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
