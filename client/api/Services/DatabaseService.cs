using Microsoft.Data.Sqlite;
using api.Models;

namespace api.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=./database.db";
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // Create Users table
            var createUsersTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Email TEXT NOT NULL UNIQUE,
                    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    LastLoginAt DATETIME
                )";

            // Create Items table (found items)
            var createItemsTable = @"
                CREATE TABLE IF NOT EXISTS Items (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    Building TEXT NOT NULL,
                    Room TEXT,
                    DateFound DATETIME NOT NULL,
                    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FoundByUserId INTEGER,
                    IsClaimed BOOLEAN NOT NULL DEFAULT 0,
                    ClaimedByUserId INTEGER,
                    ClaimedAt DATETIME,
                    FOREIGN KEY (FoundByUserId) REFERENCES Users(Id),
                    FOREIGN KEY (ClaimedByUserId) REFERENCES Users(Id)
                )";

            // Create MissingItems table
            var createMissingItemsTable = @"
                CREATE TABLE IF NOT EXISTS MissingItems (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    Building TEXT NOT NULL,
                    Room TEXT,
                    DateLost DATETIME,
                    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    ReportedByUserId INTEGER NOT NULL,
                    IsFound BOOLEAN NOT NULL DEFAULT 0,
                    FoundItemId INTEGER,
                    FOREIGN KEY (ReportedByUserId) REFERENCES Users(Id),
                    FOREIGN KEY (FoundItemId) REFERENCES Items(Id)
                )";

            using var command1 = new SqliteCommand(createUsersTable, connection);
            command1.ExecuteNonQuery();

            using var command2 = new SqliteCommand(createItemsTable, connection);
            command2.ExecuteNonQuery();

            using var command3 = new SqliteCommand(createMissingItemsTable, connection);
            command3.ExecuteNonQuery();
        }

        // User operations
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand("SELECT * FROM Users WHERE Email = @email", connection);
            command.Parameters.AddWithValue("@email", email);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new User
                {
                    Id = reader.GetInt32("Id"),
                    Name = reader.GetString("Name"),
                    Email = reader.GetString("Email"),
                    CreatedAt = reader.GetDateTime("CreatedAt"),
                    LastLoginAt = reader.IsDBNull("LastLoginAt") ? null : reader.GetDateTime("LastLoginAt")
                };
            }
            return null;
        }

        public async Task<User> CreateUserAsync(string name, string email)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand(
                "INSERT INTO Users (Name, Email, CreatedAt) VALUES (@name, @email, @createdAt); SELECT last_insert_rowid();",
                connection);
            command.Parameters.AddWithValue("@name", name);
            command.Parameters.AddWithValue("@email", email);
            command.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);

            var userId = Convert.ToInt32(await command.ExecuteScalarAsync());

            return new User
            {
                Id = userId,
                Name = name,
                Email = email,
                CreatedAt = DateTime.UtcNow
            };
        }

        public async Task UpdateLastLoginAsync(int userId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand("UPDATE Users SET LastLoginAt = @lastLoginAt WHERE Id = @userId", connection);
            command.Parameters.AddWithValue("@lastLoginAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@userId", userId);

            await command.ExecuteNonQueryAsync();
        }

        // Item operations
        public async Task<List<Item>> GetAllItemsAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand("SELECT * FROM Items ORDER BY CreatedAt DESC", connection);
            using var reader = await command.ExecuteReaderAsync();

            var items = new List<Item>();
            while (await reader.ReadAsync())
            {
                items.Add(new Item
                {
                    Id = reader.GetInt32("Id"),
                    Name = reader.GetString("Name"),
                    Description = reader.GetString("Description"),
                    Building = reader.GetString("Building"),
                    Room = reader.IsDBNull("Room") ? null : reader.GetString("Room"),
                    DateFound = reader.GetDateTime("DateFound"),
                    CreatedAt = reader.GetDateTime("CreatedAt"),
                    FoundByUserId = reader.IsDBNull("FoundByUserId") ? null : reader.GetInt32("FoundByUserId"),
                    IsClaimed = reader.GetBoolean("IsClaimed"),
                    ClaimedByUserId = reader.IsDBNull("ClaimedByUserId") ? null : reader.GetInt32("ClaimedByUserId"),
                    ClaimedAt = reader.IsDBNull("ClaimedAt") ? null : reader.GetDateTime("ClaimedAt")
                });
            }
            return items;
        }

        public async Task<Item> CreateItemAsync(Item item)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand(
                "INSERT INTO Items (Name, Description, Building, Room, DateFound, CreatedAt, FoundByUserId) " +
                "VALUES (@name, @description, @building, @room, @dateFound, @createdAt, @foundByUserId); " +
                "SELECT last_insert_rowid();",
                connection);
            command.Parameters.AddWithValue("@name", item.Name);
            command.Parameters.AddWithValue("@description", item.Description);
            command.Parameters.AddWithValue("@building", item.Building);
            command.Parameters.AddWithValue("@room", item.Room ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@dateFound", item.DateFound);
            command.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@foundByUserId", item.FoundByUserId ?? (object)DBNull.Value);

            var itemId = Convert.ToInt32(await command.ExecuteScalarAsync());
            item.Id = itemId;
            item.CreatedAt = DateTime.UtcNow;
            return item;
        }

        // Missing Item operations
        public async Task<MissingItem> CreateMissingItemAsync(MissingItem missingItem)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqliteCommand(
                "INSERT INTO MissingItems (Name, Description, Building, Room, DateLost, CreatedAt, ReportedByUserId) " +
                "VALUES (@name, @description, @building, @room, @dateLost, @createdAt, @reportedByUserId); " +
                "SELECT last_insert_rowid();",
                connection);
            command.Parameters.AddWithValue("@name", missingItem.Name);
            command.Parameters.AddWithValue("@description", missingItem.Description);
            command.Parameters.AddWithValue("@building", missingItem.Building);
            command.Parameters.AddWithValue("@room", missingItem.Room ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@dateLost", missingItem.DateLost ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@reportedByUserId", missingItem.ReportedByUserId);

            var missingItemId = Convert.ToInt32(await command.ExecuteScalarAsync());
            missingItem.Id = missingItemId;
            missingItem.CreatedAt = DateTime.UtcNow;
            return missingItem;
        }
    }
}

