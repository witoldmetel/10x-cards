using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TenXCards.API.Middleware;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;
using TenXCards.Infrastructure.Data;
using TenXCards.Infrastructure.Repositories;
using TenXCards.Infrastructure.Services;
using System.Reflection;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.AllowTrailingCommas = true;
    });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "TenXCards API", 
        Version = "v1",
        Description = "API for managing flashcards with spaced repetition",
        Contact = new OpenApiContact
        {
            Name = "TenXCards Team",
            Email = "support@tenxcards.com"
        }
    });

    // Include XML comments from all relevant assemblies
    var xmlApiFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlApiPath = Path.Combine(AppContext.BaseDirectory, xmlApiFile);
    c.IncludeXmlComments(xmlApiPath);

    var xmlCoreFile = "TenXCards.Core.xml";
    var xmlCorePath = Path.Combine(AppContext.BaseDirectory, xmlCoreFile);
    if (File.Exists(xmlCorePath))
    {
        c.IncludeXmlComments(xmlCorePath);
    }

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable annotations
    c.EnableAnnotations();

    // Use full type names to avoid conflicts
    c.CustomSchemaIds(type => type.FullName);
});

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHashService, PasswordHashService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddScoped<IFlashcardService, FlashcardService>();
builder.Services.AddScoped<ICollectionService, CollectionService>();
builder.Services.AddScoped<ICollectionRepository, CollectionRepository>();
builder.Services.AddScoped<IFlashcardRepository, FlashcardRepository>();

// Configure OpenRouter
builder.Services.Configure<TenXCards.Core.Models.OpenRouterOptions>(
    builder.Configuration.GetSection(TenXCards.Core.Models.OpenRouterOptions.SectionName));
builder.Services.AddSingleton<IValidateOptions<TenXCards.Core.Models.OpenRouterOptions>, TenXCards.Core.Models.OpenRouterOptionsValidator>();

builder.Services.AddHttpClient<TenXCards.Core.Services.IOpenRouterService, TenXCards.Infrastructure.Services.OpenRouterService>()
    .ConfigureHttpClient((sp, client) =>
    {
        var options = sp.GetRequiredService<IOptions<TenXCards.Core.Models.OpenRouterOptions>>().Value;
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);
        client.DefaultRequestHeaders.Add("HTTP-Referer", options.SiteUrl);
        client.DefaultRequestHeaders.Add("X-Title", options.SiteName);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.UserAgent.ParseAdd("10XCards/1.0");
        client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
    });

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

// Configure routing
app.MapControllers();

// Check database connection on startup
var logger = app.Logger;

try
{
    using var scope = app.Services.CreateScope();
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
catch (Exception ex)
{
    logger.LogError(ex, "❌ An error occurred while checking the database connection");
}

// Print API information
logger.LogInformation("🚀 API is running on:");
logger.LogInformation("   - Main API: http://localhost:5001");
logger.LogInformation("   - Swagger UI: http://localhost:5001/swagger");

app.Run();
