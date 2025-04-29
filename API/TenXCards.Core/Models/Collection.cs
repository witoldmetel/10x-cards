using System;

namespace TenXCards.Core.Models
{
    public class Collection
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
}
