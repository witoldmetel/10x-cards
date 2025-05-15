using System;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services;

public interface IUserService
{
    Task<UserRegistrationResponse> RegisterUserAsync(UserRegistrationRequest request);
    Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request);
    Task<PasswordResetResponse> ResetPasswordAsync(PasswordResetRequest request);
    Task<UserDto> GetUserDataAsync(Guid id);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task DeleteUserAsync(Guid id);
    Task<bool> ValidatePasswordAsync(Guid id, string password);
    Task<UserLoginResponse> UpdatePasswordAsync(Guid id, UpdatePasswordRequest request);
} 