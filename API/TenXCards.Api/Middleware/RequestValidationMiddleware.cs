using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TenXCards.API.Middleware;

public class RequestValidationMiddleware : IMiddleware
{
    private readonly ILogger<RequestValidationMiddleware> _logger;

    public RequestValidationMiddleware(ILogger<RequestValidationMiddleware> logger)
    {
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error occurred");
            await HandleValidationExceptionAsync(context, ex);
        }
    }

    private static async Task HandleValidationExceptionAsync(HttpContext context, ValidationException exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

        var problemDetails = new ValidationProblemDetails
        {
            Status = (int)HttpStatusCode.BadRequest,
            Title = "Validation Error",
            Detail = exception.Message,
            Instance = context.Request.Path,
            Errors = new Dictionary<string, string[]>
            {
                { "ValidationError", new[] { exception.Message } }
            }
        };

        var json = JsonSerializer.Serialize(problemDetails);
        await context.Response.WriteAsync(json);
    }
} 