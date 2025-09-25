using Microsoft.AspNetCore.Mvc;
using api.Services;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public UserController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate Crimson email
                if (!IsCrimsonEmail(request.Email))
                {
                    return BadRequest(new { message = "Only @crimson.ua.edu email addresses are allowed for registration." });
                }

                // Check if user already exists
                var existingUser = await _databaseService.GetUserByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return Conflict(new { message = "A user with this email already exists." });
                }

                // Create new user
                var user = await _databaseService.CreateUserAsync(request.Name, request.Email);
                
                return Ok(new { 
                    message = "User registered successfully.",
                    user = new { user.Id, user.Name, user.Email, user.CreatedAt }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while registering the user.", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate Crimson email
                if (!IsCrimsonEmail(request.Email))
                {
                    return BadRequest(new { message = "Only @crimson.ua.edu email addresses are allowed." });
                }

                // Find user by email
                var user = await _databaseService.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    return NotFound(new { message = "No user found with this email address." });
                }

                // Update last login
                await _databaseService.UpdateLastLoginAsync(user.Id);

                return Ok(new { 
                    message = "Login successful.",
                    user = new { user.Id, user.Name, user.Email, user.CreatedAt }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while logging in.", error = ex.Message });
            }
        }

        [HttpGet("validate-email/{email}")]
        public IActionResult ValidateEmail(string email)
        {
            var isValid = IsCrimsonEmail(email);
            return Ok(new { 
                email = email,
                isValid = isValid,
                message = isValid ? "Valid Crimson email" : "Only @crimson.ua.edu email addresses are allowed"
            });
        }

        private bool IsCrimsonEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return email.EndsWith("@crimson.ua.edu", StringComparison.OrdinalIgnoreCase);
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}

