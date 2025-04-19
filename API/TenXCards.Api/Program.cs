using Microsoft.EntityFrameworkCore;
using TenXCards.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Configure PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Get logger instance once
var logger = app.Services.GetRequiredService<ILogger<Program>>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before other middleware
app.UseCors("AllowClient");

app.UseAuthorization();
app.MapControllers();

// Check database connection on startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Checking database connection...");
        
        bool canConnect = await context.Database.CanConnectAsync();
        
        if (canConnect)
        {
            logger.LogInformation("✅ Successfully connected to the database");
            await context.Database.EnsureCreatedAsync();
            logger.LogInformation("✅ Database is ready");
        }
        else
        {
            logger.LogError("❌ Failed to connect to the database");
        }
    }
}
catch (Exception ex)
{
    logger.LogError(ex, "❌ An error occurred while checking the database connection");
}

// Print API information
logger.LogInformation("🚀 API is running on:");
logger.LogInformation("   - Main API: http://localhost:5001");
logger.LogInformation("   - Swagger UI: http://localhost:5001/swagger");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
