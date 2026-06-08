using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { detail = "Username and password are required." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ipAddress, userAgent, cancellationToken);
        if (!result.Success || result.Response is null)
        {
            return Unauthorized(new { detail = result.Detail });
        }

        Response.Cookies.Append("accessToken", result.Response.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = result.Response.ExpiresAt
        });

        return Ok(result.Response);
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { detail = "A valid email is required." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.ForgotPasswordAsync(request, ipAddress, userAgent, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(new { detail = result.Detail });
        }

        return Ok(new
        {
            message = result.Detail,
            otpExpiresAt = result.OtpExpiresAt
        });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { detail = "Invalid reset password payload." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.ResetPasswordAsync(request, ipAddress, userAgent, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(new { detail = result.Detail });
        }

        Response.Cookies.Delete("accessToken");
        return Ok(new { message = result.Detail });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var tokenId = User.FindFirstValue("jti") ?? User.FindFirstValue(ClaimTypes.Sid);
        var username = User.FindFirstValue(ClaimTypes.Name) ?? "unknown";
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        await _authService.LogoutAsync(tokenId, username, ipAddress, userAgent, cancellationToken);
        Response.Cookies.Delete("accessToken");

        return Ok(new { message = "Logged out successfully." });
    }
}
