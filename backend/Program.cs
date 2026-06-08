using System.Text;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var configuredConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured");
var connectionString = BuildConnectionString(builder.Configuration, configuredConnectionString);

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

var jwtSecretKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured");
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"]
    ?? throw new InvalidOperationException("JwtSettings:Issuer is not configured");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token))
                {
                    context.Token = context.Request.Cookies["accessToken"];
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins.Length == 0)
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(corsOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    });
});

var idleTimeoutMinutes = builder.Configuration.GetValue<int?>("SessionSettings:IdleTimeoutMinutes") ?? 30;
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(idleTimeoutMinutes);
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
});

builder.Services.AddDistributedMemoryCache();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ILockoutService, LockoutService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IPasswordPolicyService, PasswordPolicyService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.MapControllers();

app.Run();

static string BuildConnectionString(IConfiguration configuration, string configuredConnectionString)
{
    var databaseName = Environment.GetEnvironmentVariable("DB_NAME");
    var username = Environment.GetEnvironmentVariable("DB_USERNAME");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

    if (string.IsNullOrWhiteSpace(databaseName) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
    {
        return configuredConnectionString;
    }

    var builder = new NpgsqlConnectionStringBuilder(configuredConnectionString)
    {
        Host = configuration["Database:Host"] ?? "localhost",
        Port = int.TryParse(configuration["Database:Port"], out var port) ? port : 5432,
        Database = databaseName,
        Username = username,
        Password = password
    };

    return builder.ConnectionString;
}
