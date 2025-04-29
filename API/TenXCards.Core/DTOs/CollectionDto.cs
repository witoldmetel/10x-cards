using System;
using System.Collections.Generic;

namespace TenXCards.Core.DTOs
{
    public class CollectionResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public int TotalCards { get; set; }
        public int DueCards { get; set; }
        public string Color { get; set; }
    }

    public class CreateCollectionDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
    }

    public class UpdateCollectionDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
    }
}
