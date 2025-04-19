using System.ComponentModel.DataAnnotations;

namespace TenXCards.Api.DTOs;

public class ClientCredentialsRequest
{
    [Required]
    public string ClientId { get; set; } = string.Empty;

    [Required]
    public string ClientSecret { get; set; } = string.Empty;
} 