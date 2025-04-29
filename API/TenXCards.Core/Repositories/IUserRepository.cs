using System.Threading.Tasks;
using TenXCards.Core.Models;

namespace TenXCards.Core.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
    Task UpdateAsync(User user);
} 