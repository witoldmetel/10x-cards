using System;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services;

public interface IUserService
{
    Task<UserRegistrationResponse> RegisterUserAsync(UserRegistrationRequest request);
    Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request);
    Task<PasswordResetResponse> ResetPasswordAsync(PasswordResetRequest request);
    Task<UserDataResponse> GetUserDataAsync(Guid id);
    Task<UserDataResponse> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task DeleteUserAsync(Guid id);
    Task<bool> ValidatePasswordAsync(Guid id, string password);
} 