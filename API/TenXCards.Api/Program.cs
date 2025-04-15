using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using TenXCards.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "10x Cards API", 
        Version = "v1",
        Description = "API for managing flashcards with AI integration"
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",    // Client default port
                "http://localhost:5001"     // API port
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("Development"); // Use the development CORS policy
}
else 
{
    app.UseCors("AllowAll"); // Fallback to the default policy
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Try to ensure database is created and migrations are applied
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
    }
}
catch (Exception ex)
{
    // Log the error but don't prevent the application from starting
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while migrating the database.");
}

app.Run();
