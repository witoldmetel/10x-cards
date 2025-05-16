using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace TenXCards.Core.Services
{
    public class StudyService : IStudyService
    {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IFlashcardRepository _flashcardRepository;

        public StudyService(ICollectionRepository collectionRepository, IFlashcardRepository flashcardRepository)
        {
            _collectionRepository = collectionRepository;
            _flashcardRepository = flashcardRepository;
        }

        public async Task<StudySessionResponse> ProcessStudySessionResults(StudySessionRequest request)
        {
            var collection = await _collectionRepository.GetByIdAsync(request.CollectionId, request.UserId);
            if (collection == null)
                throw new InvalidOperationException("Collection not found");

            var flashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = request.CollectionId,
                UserId = request.UserId,
                Offset = 0,
                Limit = int.MaxValue
            });

            foreach (var result in request.Results)
            {
                var flashcard = flashcards.Items.FirstOrDefault(f => f.Id == result.FlashcardId);
                if (flashcard == null) continue;

                UpdateSM2Algorithm(flashcard, result.Grade);
                flashcard.ReviewedAt = result.StudiedAt;

                await _flashcardRepository.UpdateSM2Parameters(
                    flashcard.Id,
                    flashcard.Sm2Repetitions,
                    flashcard.Sm2Interval,
                    flashcard.Sm2Efactor,
                    flashcard.Sm2DueDate ?? DateTime.UtcNow
                );
            }

            // Update collection stats
            var lastStudied = request.Results.Max(r => r.StudiedAt);
            var masteryLevel = CalculateMasteryLevel(flashcards.Items);

            // Update streak
            UpdateStreak(collection, lastStudied);

            collection.LastStudied = lastStudied;
            collection.MasteryLevel = masteryLevel;

            await _collectionRepository.UpdateAsync(collection);

            return new StudySessionResponse
            {
                MasteryLevel = masteryLevel,
                LastStudied = lastStudied,
                TotalCards = flashcards.Total,
                MasteredCards = flashcards.Items.Count(f => f.Sm2Repetitions >= 3),
                CurrentStreak = collection.CurrentStreak,
                BestStreak = collection.BestStreak
            };
        }

        private void UpdateStreak(Collection collection, DateTime currentStudyDate)
        {
            var today = DateTime.UtcNow.Date;
            var lastStudyDate = collection.LastStudied?.Date;
            var currentStudyDateDate = currentStudyDate.Date;

            // If this is the first study session
            if (!lastStudyDate.HasValue)
            {
                collection.CurrentStreak = 1;
                collection.BestStreak = 1;
                return;
            }

            // If studied on a different day
            if (currentStudyDateDate != lastStudyDate)
            {
                // If studied the previous day, increment streak
                if (currentStudyDateDate == lastStudyDate.Value.AddDays(1))
                {
                    collection.CurrentStreak++;
                    if (collection.CurrentStreak > collection.BestStreak)
                    {
                        collection.BestStreak = collection.CurrentStreak;
                    }
                }
                // If missed a day or more, reset streak
                else if (currentStudyDateDate > lastStudyDate)
                {
                    collection.CurrentStreak = 1;
                }
                // If it's an old study session, don't update streak
            }
        }

        private void UpdateSM2Algorithm(Flashcard flashcard, int grade)
        {
            if (grade < 0 || grade > 5)
                throw new ArgumentException("Grade must be between 0 and 5");

            if (grade >= 3)
            {
                // Calculate new E-Factor
                flashcard.Sm2Efactor = Math.Max(1.3, 
                    flashcard.Sm2Efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

                // Calculate new interval
                if (flashcard.Sm2Repetitions == 0)
                    flashcard.Sm2Interval = 1;
                else if (flashcard.Sm2Repetitions == 1)
                    flashcard.Sm2Interval = 6;
                else
                    flashcard.Sm2Interval = (int)Math.Round(flashcard.Sm2Interval * flashcard.Sm2Efactor);

                flashcard.Sm2Repetitions++;
            }
            else
            {
                // Reset the repetition count on failure
                flashcard.Sm2Repetitions = 0;
                flashcard.Sm2Interval = 1;
            }

            // Set next review date
            flashcard.Sm2DueDate = DateTime.UtcNow.AddDays(flashcard.Sm2Interval);
        }

        private double CalculateMasteryLevel(IEnumerable<Flashcard> flashcards)
        {
            var totalCards = flashcards.Count();
            if (totalCards == 0) return 0;

            var masteredCards = flashcards.Count(f => f.Sm2Repetitions >= 3);
            return (double)masteredCards / totalCards * 100;
        }
    }
} 