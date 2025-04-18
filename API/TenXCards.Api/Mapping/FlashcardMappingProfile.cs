using AutoMapper;
using TenXCards.Api.Models;
using TenXCards.Api.DTOs;

namespace TenXCards.Api.Mapping
{
    public class FlashcardMappingProfile : Profile
    {
        public FlashcardMappingProfile()
        {
            CreateMap<CreateFlashcardRequest, Flashcard>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Sm2Repetitions, opt => opt.MapFrom(_ => 0))
                .ForMember(dest => dest.Sm2Interval, opt => opt.MapFrom(_ => 0))
                .ForMember(dest => dest.Sm2Efactor, opt => opt.MapFrom(_ => 2.5m));

            CreateMap<Flashcard, FlashcardResponse>();
        }
    }
} 