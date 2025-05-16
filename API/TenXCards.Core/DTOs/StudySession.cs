using System;
using System.Collections.Generic;

namespace TenXCards.Core.DTOs
{
    public class StudySessionResult
    {
        public Guid FlashcardId { get; set; }
        public int Grade { get; set; }
        public DateTime StudiedAt { get; set; }
    }

    public record StudySessionRequest
    {
        public Guid CollectionId { get; init; }
        public Guid UserId { get; init; }
        public List<StudySessionResult> Results { get; init; } = new();
    }

    public class StudySessionResponse
    {
        public double MasteryLevel { get; set; }
        public DateTime LastStudied { get; set; }
        public int TotalCards { get; set; }
        public int MasteredCards { get; set; }
        public int CurrentStreak { get; set; }
        public int BestStreak { get; set; }
    }
} 