namespace TenXCards.Core.Models
{
    public class OpenAIConfiguration
    {
        /// <summary>
        /// The API key used for authentication with the OpenAI service
        /// </summary>
        public required string ApiKey { get; set; }

        /// <summary>
        /// The AI model to use for generating responses (e.g. gpt-4, gpt-3.5-turbo)
        /// </summary>
        public required string Model { get; set; }

        /// <summary>
        /// The base URL for the OpenAI API endpoint
        /// </summary>
        public required string BaseUrl { get; set; }

        /// <summary>
        /// The name of the site making the API requests
        /// </summary>
        public required string SiteName { get; set; }

        /// <summary>
        /// The URL of the site making the API requests
        /// </summary>
        public required string SiteUrl { get; set; }

        /// <summary>
        /// Controls randomness in the model's output (0.0 to 1.0).
        /// Lower values like 0.2 make the output more focused and deterministic.
        /// Higher values like 0.8 make the output more creative and diverse.
        /// Default is 0.7 for a good balance of creativity and consistency.
        /// </summary>
        public float Temperature { get; set; } = 0.7f;

        /// <summary>
        /// The maximum number of tokens to generate in the response
        /// </summary>
        public int MaxTokens { get; set; } = 1000;
    }
}