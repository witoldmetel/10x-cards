using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services;

public interface IUserService
{
    Task<UserRegistrationResponse> RegisterAsync(UserRegistrationRequest request);
    Task<UserLoginResponse> LoginAsync(UserLoginRequest request);
} 