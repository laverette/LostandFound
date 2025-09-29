using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework with SQLite
builder.Services.AddDbContext<LostAndFoundContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin() // Allow all origins for development
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// In production, serve static files from the frontend
if (app.Environment.IsProduction())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Fallback to serve the frontend for client-side routing
if (app.Environment.IsProduction())
{
    app.MapFallbackToFile("index.html");
}

// Ensure database is created and fix schema
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LostAndFoundContext>();
    context.Database.EnsureCreated();
    
    // Fix: Add IsVisible column if it doesn't exist
    try
    {
        await context.Database.ExecuteSqlRawAsync("ALTER TABLE FoundItems ADD COLUMN IsVisible INTEGER NOT NULL DEFAULT 1");
        Console.WriteLine("Successfully added IsVisible column to FoundItems table");
    }
    catch (Exception ex)
    {
        if (ex.Message.Contains("duplicate column name"))
        {
            Console.WriteLine("IsVisible column already exists");
        }
        else
        {
            Console.WriteLine($"Error adding IsVisible column: {ex.Message}");
        }
    }
}

app.Run();
