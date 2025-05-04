using System.Text.RegularExpressions;

namespace TenXCards.Infrastructure.Utils
{
    public static class TextSanitizer
    {
        public static string SanitizeForJson(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return input;
            }

            // Replace any backslashes with double backslashes
            input = input.Replace("\\", "\\\\");
            
            // Replace double quotes with escaped double quotes
            input = input.Replace("\"", "\\\"");
            
            // Replace single quotes that are part of contractions or possessives
            input = input.Replace("'s", "\"s");
            input = input.Replace("'t", "\"t");
            input = input.Replace("'m", "\"m");
            input = input.Replace("'re", "\"re");
            input = input.Replace("'ve", "\"ve");
            input = input.Replace("'ll", "\"ll");
            input = input.Replace("'d", "\"d");
            
            // Remove any non-printable characters
            input = Regex.Replace(input, @"[\x00-\x1F\x7F]", string.Empty);

            return input;
        }

        public static string SanitizeForAI(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return input;
            }

            // Remove any potential harmful characters or patterns
            input = Regex.Replace(input, @"[^\u0020-\u007E\u00A0-\u00FF]", " ");
            
            // Normalize whitespace
            input = Regex.Replace(input, @"\s+", " ").Trim();

            return input;
        }
    }
} 