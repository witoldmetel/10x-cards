using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services;

public interface IUserService
{
    Task<UserRegistrationResult> RegisterUserAsync(UserRegistrationRequest request);
    Task<UserLoginResult> LoginUserAsync(UserLoginRequest request);
    Task<PasswordResetResult> ResetPasswordAsync(PasswordResetRequest request);
} 