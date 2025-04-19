using AutoMapper;
using TenXCards.Api.Models;
using TenXCards.Api.DTOs;

namespace TenXCards.Api.Mapping
{
    /// <summary>
    /// AutoMapper profile for mapping between Flashcard entities and DTOs
    /// </summary>
    public class FlashcardProfile : Profile
    {
        public FlashcardProfile()
        {
            // Entity to Response DTO
            CreateMap<Flashcard, FlashcardResponse>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.Tag))
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.Category));

            // Create Request to Entity
            CreateMap<CreateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.Tag, opt => opt.MapFrom(src => src.Tags))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Categories))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            // Update Request to Entity
            CreateMap<UpdateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.Tag, opt => opt.MapFrom(src => src.Tags))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Categories))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
} 