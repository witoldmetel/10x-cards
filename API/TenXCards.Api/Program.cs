using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TenXCards.API.Middleware;
using TenXCards.Core.DTOs;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;
using TenXCards.Infrastructure.Data;
using TenXCards.Infrastructure.Repositories;
using TenXCards.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("fixed", options =>
    {
        options.PermitLimit = 5;
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 2;
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message = "Too many requests. Please try again later.",
            retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter) 
                ? retryAfter.TotalSeconds 
                : 60
        }, token);
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration["AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// Configure database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHashService, PasswordHashService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Register middleware
builder.Services.AddTransient<GlobalExceptionHandlingMiddleware>();
builder.Services.AddTransient<RequestValidationMiddleware>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add middleware to pipeline
app.UseMiddleware<RequestValidationMiddleware>();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Use CORS before auth middleware
app.UseCors("AllowFrontend");

// Use rate limiting
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// User endpoints
app.MapPost("/api/users/register", async (IUserService userService, UserRegistrationRequest request) =>
{
    try
    {
        var response = await userService.RegisterAsync(request);
        return Results.Created($"/api/users/{response.Id}", response);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
})
.WithName("RegisterUser")
.WithOpenApi()
.RequireRateLimiting("fixed");

app.MapPost("/api/users/login", async (IUserService userService, UserLoginRequest request) =>
{
    try
    {
        var response = await userService.LoginAsync(request);
        return Results.Ok(response);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
})
.WithName("LoginUser")
.WithOpenApi()
.RequireRateLimiting("fixed");

app.Run();
