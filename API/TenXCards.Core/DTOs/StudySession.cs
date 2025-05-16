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

    public class StudySessionRequest
    {
        public Guid CollectionId { get; set; }
        public List<StudySessionResult> Results { get; set; } = new();
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