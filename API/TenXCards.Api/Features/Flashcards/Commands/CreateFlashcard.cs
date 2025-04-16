using AutoMapper;
using FluentValidation;
using MediatR;
using TenXCards.Api.Data;
using TenXCards.Api.DTOs;
using TenXCards.Api.Models;

namespace TenXCards.Api.Features.Flashcards.Commands
{
    public class CreateFlashcardCommand : IRequest<FlashcardResponse>
    {
        public required string Question { get; set; }
        public required string Answer { get; set; }
        public required string ReviewStatus { get; set; }
        public string[]? Tags { get; set; }
        public string[]? Categories { get; set; }
    }

    public class CreateFlashcardCommandValidator : AbstractValidator<CreateFlashcardCommand>
    {
        public CreateFlashcardCommandValidator()
        {
            RuleFor(x => x.Question)
                .NotEmpty()
                .MaximumLength(1000)
                .WithMessage("Question is required and cannot exceed 1000 characters");

            RuleFor(x => x.Answer)
                .NotEmpty()
                .MaximumLength(2000)
                .WithMessage("Answer is required and cannot exceed 2000 characters");

            RuleFor(x => x.ReviewStatus)
                .NotEmpty()
                .MaximumLength(50)
                .WithMessage("Review status is required and cannot exceed 50 characters");
        }
    }

    public class CreateFlashcardCommandHandler : IRequestHandler<CreateFlashcardCommand, FlashcardResponse>
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CreateFlashcardCommandHandler(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<FlashcardResponse> Handle(CreateFlashcardCommand request, CancellationToken cancellationToken)
        {
            var flashcard = new Flashcard
            {
                Question = request.Question,
                Answer = request.Answer,
                ReviewStatus = request.ReviewStatus,
                Tag = request.Tags,
                Category = request.Categories,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Flashcards.Add(flashcard);
            await _context.SaveChangesAsync(cancellationToken);

            return _mapper.Map<FlashcardResponse>(flashcard);
        }
    }
} 