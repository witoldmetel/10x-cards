using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.Exceptions;
using System;
using System.Collections.Generic;

namespace TenXCards.API.Controllers
{
    public static class ApiControllerExtensions
    {
        public static ActionResult HandleApiException(this ControllerBase controller, Exception ex)
        {
            return ex switch
            {
                BadRequestException badRequestEx => controller.BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = badRequestEx.Message,
                    Status = StatusCodes.Status400BadRequest
                }),
                ExternalServiceException externalEx => controller.StatusCode(StatusCodes.Status502BadGateway, new ProblemDetails
                {
                    Title = "External Service Error",
                    Detail = externalEx.Message,
                    Status = StatusCodes.Status502BadGateway
                }),
                _ => controller.StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "An error occurred",
                    Detail = GetDetailedErrorMessage(ex),
                    Status = StatusCodes.Status500InternalServerError
                })
            };
        }

        private static string GetDetailedErrorMessage(Exception ex)
        {
            var allExceptions = new List<string>();
            var currentEx = ex;
            
            while (currentEx != null)
            {
                allExceptions.Add($"{currentEx.GetType().Name}: {currentEx.Message}");
                currentEx = currentEx.InnerException;
            }
            
            return string.Join(" -> ", allExceptions);
        }
    }
} 