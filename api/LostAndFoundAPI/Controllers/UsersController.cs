using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;
using LostAndFoundAPI.Models;
using System.Security.Cryptography;
using System.Text;

namespace LostAndFoundAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public UsersController(LostAndFoundContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<ActionResult<User>> RegisterUser(RegisterRequest request)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists");
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                UserType = UserType.Student, // Default to student for registration
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Return user without password hash
            return Ok(new { 
                Id = user.Id, 
                Name = user.Name, 
                Email = user.Email, 
                UserType = user.UserType 
            });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password");
            }

            return Ok(new LoginResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                UserType = user.UserType
            });
        }

        // POST: api/users/admin-login
        [HttpPost("admin-login")]
        public async Task<ActionResult<LoginResponse>> AdminLogin(AdminLoginRequest request)
        {
            // For now, use simple password check (in production, use proper admin authentication)
            if (request.Password != "1234")
            {
                return Unauthorized("Invalid admin password");
            }

            // Find or create admin user
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.UserType == UserType.Admin);
            
            if (adminUser == null)
            {
                adminUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Admin",
                    Email = "admin@university.edu",
                    PasswordHash = HashPassword("1234"),
                    UserType = UserType.Admin,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();
            }

            return Ok(new LoginResponse
            {
                Id = adminUser.Id,
                Name = adminUser.Name,
                Email = adminUser.Email,
                UserType = adminUser.UserType
            });
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }

    // Request/Response DTOs
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AdminLoginRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserType UserType { get; set; }
    }
}
