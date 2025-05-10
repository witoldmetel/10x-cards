using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using TenXCards.Core.Services;
using TenXCards.Core.Models;
using TenXCards.Core.DTOs;
using System.Threading;
using System.Collections.Generic;
using System.Text.Json;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly IFlashcardService _flashcardService;
        private readonly ILogger<TestController> _logger;

        public TestController(
            IOpenRouterService openRouterService,
            IFlashcardService flashcardService,
            ILogger<TestController> logger)
        {
            _openRouterService = openRouterService;
            _flashcardService = flashcardService;
            _logger = logger;
        }

        [HttpPost("openrouter")]
        public async Task<IActionResult> TestOpenRouter(CancellationToken cancellationToken)
        {
            var sourceText = "Poland, officially the Republic of Poland, is a country in Central Europe. It extends from the Baltic Sea in the north to the Sudetes and Carpathian Mountains in the south, bordered by Lithuania and Russia to the northeast, Belarus and Ukraine to the east, Slovakia and the Czech Republic to the south, and Germany to the west. The territory is characterised by a varied landscape, diverse ecosystems, and temperate climate. Poland is composed of sixteen voivodeships and is the fifth most populous member state of the European Union (EU), with over 38 million people, and the fifth largest EU country by land area, covering a combined area of 312,696 km2 (120,733 sq mi). The capital and largest city is Warsaw; other major cities include Kraków, Wrocław, Łódź, Poznań, and Gdańsk.";
            
            var systemMessage = "Create 3 flashcards based on the provided text. Return a JSON object with a 'flashcards' field containing an array of objects, where each object has 'front' and 'back' fields. Example format: {'flashcards': [{'front': 'Question 1', 'back': 'Answer 1'}, {'front': 'Question 2', 'back': 'Answer 2'}]}";

            try
            {
                var content = await _openRouterService.GetChatResponseAsync(
                    sourceText,
                    systemMessage,
                    null,
                    new Dictionary<string, object>
                    {
                        { "temperature", 0.7 },
                        { "max_tokens", 4000 }
                    },
                    new ResponseFormat { Type = "json_object" },
                    cancellationToken);

                _logger.LogInformation("Raw content: {Content}", content);

                // Try to parse the response
                var jsonOptions = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };

                var response = JsonSerializer.Deserialize<FlashcardsResponse>(content, jsonOptions);

                return Ok(new { 
                    rawContent = content,
                    parsedContent = response,
                    message = "Check the logs for detailed response information"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing OpenRouter");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("flashcards/generate")]
        public async Task<IActionResult> TestFlashcardGeneration(CancellationToken cancellationToken)
        {
            try
            {
                var request = new FlashcardGenerationRequestDto
                {
                    SourceText = "Poland, officially the Republic of Poland, is a country in Central Europe. It extends from the Baltic Sea in the north to the Sudetes and Carpathian Mountains in the south, bordered by Lithuania and Russia to the northeast, Belarus and Ukraine to the east, Slovakia and the Czech Republic to the south, and Germany to the west. The territory is characterised by a varied landscape, diverse ecosystems, and temperate climate. Poland is composed of sixteen voivodeships and is the fifth most populous member state of the European Union (EU), with over 38 million people, and the fifth largest EU country by land area, covering a combined area of 312,696 km2 (120,733 sq mi). The capital and largest city is Warsaw; other major cities include Kraków, Wrocław, Łódź, Poznań, and Gdańsk.",
                    Count = 3
                };

                // Use a test collection ID - you'll need to replace this with a valid collection ID from your database
                var collectionId = Guid.Parse("e70062e6-b3aa-47e1-904b-30835c549723");

                var result = await _flashcardService.GenerateFlashcardsAsync(request, collectionId, cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing flashcard generation");
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class FlashcardsResponse
    {
        public List<Flashcard> Flashcards { get; set; } = new();
    }

    public class Flashcard
    {
        public string Front { get; set; } = string.Empty;
        public string Back { get; set; } = string.Empty;
    }
} 