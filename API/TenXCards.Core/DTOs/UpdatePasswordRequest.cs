namespace TenXCards.Core.DTOs
{
    public class UpdatePasswordRequest
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
} 