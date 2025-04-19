using Duende.IdentityServer;
using Duende.IdentityServer.Models;

namespace TenXCards.Api.Features.Auth;

public static class IdentityServerConfig
{
    public static IEnumerable<IdentityResource> IdentityResources =>
        new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResources.Email()
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new List<ApiScope>
        {
            new ApiScope("tenxcards.api", "TenX Cards API"),
            new ApiScope("tenxcards.read", "Read access to TenX Cards API"),
            new ApiScope("tenxcards.write", "Write access to TenX Cards API")
        };

    public static IEnumerable<ApiResource> ApiResources =>
        new List<ApiResource>
        {
            new ApiResource("tenxcards.api", "TenX Cards API")
            {
                Scopes = { "tenxcards.api", "tenxcards.read", "tenxcards.write" }
            }
        };

    public static IEnumerable<Client> Clients =>
        new List<Client>
        {
            // Machine to machine client (e.g., background services)
            new Client
            {
                ClientId = "tenxcards.service",
                ClientName = "TenX Cards Service Client",
                AllowedGrantTypes = GrantTypes.ClientCredentials,
                ClientSecrets = { new Secret("your-service-secret".Sha256()) },
                AllowedScopes = { "tenxcards.api" }
            },

            // Interactive client (e.g., web application)
            new Client
            {
                ClientId = "tenxcards.web",
                ClientName = "TenX Cards Web Application",
                AllowedGrantTypes = GrantTypes.Code,
                RequirePkce = true,
                RequireClientSecret = false,
                
                RedirectUris = { "http://localhost:3000/callback" },
                PostLogoutRedirectUris = { "http://localhost:3000" },
                AllowedCorsOrigins = { "http://localhost:3000" },

                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Profile,
                    IdentityServerConstants.StandardScopes.Email,
                    "tenxcards.read",
                    "tenxcards.write"
                },
                
                AllowOfflineAccess = true,
                RequireConsent = false
            }
        };
} 