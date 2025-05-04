using Microsoft.Extensions.Options;
using TenXCards.Core.Models;

namespace TenXCards.Infrastructure.Services
{
    public class OpenRouterOptionsValidator : IValidateOptions<OpenRouterOptions>
    {
        public ValidateOptionsResult Validate(string? name, OpenRouterOptions options)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(options.ApiKey))
            {
                errors.Add("API key is required");
            }
            else if (options.ApiKey.Length < 20)
            {
                errors.Add("API key appears to be invalid (too short)");
            }

            if (string.IsNullOrWhiteSpace(options.DefaultModel))
            {
                errors.Add("Default model name is required");
            }

            if (options.TimeoutSeconds < 10)
            {
                errors.Add("Timeout must be at least 10 seconds");
            }

            return errors.Count > 0
                ? ValidateOptionsResult.Fail(errors)
                : ValidateOptionsResult.Success;
        }
    }
} 