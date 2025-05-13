using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TenXCards.API.Middleware;

public class GlobalExceptionHandlingMiddleware : IMiddleware
{
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            await HandleExceptionAsync(context, ex, HttpStatusCode.Unauthorized);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation error occurred");
            await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred");
            await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, HttpStatusCode statusCode)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = GetTitle(statusCode),
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        var json = JsonSerializer.Serialize(problemDetails);
        await context.Response.WriteAsync(json);
    }

    private static string GetTitle(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest => "Bad Request",
        HttpStatusCode.NotFound => "Resource Not Found",
        HttpStatusCode.Unauthorized => "Unauthorized",
        HttpStatusCode.InternalServerError => "Internal Server Error",
        _ => "An error occurred"
    };
} 