using System;
using System.Collections.Generic;
using Microsoft.Extensions.Options;

namespace TenXCards.Infrastructure.Services
{
    public class OpenRouterOptionsValidator : IValidateOptions<OpenRouterOptions>
    {
        public ValidateOptionsResult Validate(string? name, OpenRouterOptions options)
        {
            if (string.IsNullOrEmpty(options.ApiKey))
            {
                return ValidateOptionsResult.Fail("API key must be provided for OpenRouter service");
            }

            if (string.IsNullOrEmpty(options.BaseUrl))
            {
                return ValidateOptionsResult.Fail("Base URL must be provided for OpenRouter service");
            }

            return ValidateOptionsResult.Success;
        }
    }
} 