using System;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;

namespace TenXCards.Core.Services;

public interface IUserService
{
    Task<UserLoginResponse> RegisterUserAsync(UserRegistrationRequest request);
    Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request);
    Task<PasswordResetResult> ResetPasswordAsync(PasswordResetRequest request);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
    Task UpdateAsync(User user);
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> UpdateUserAsync(Guid id, UpdateUserRequest dto);
} 