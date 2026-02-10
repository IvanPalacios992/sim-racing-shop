using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public record PaginatedResultDto<T>
    {
        public List<T> Items { get; init; } = new();
        public int TotalCount { get; init; }
        public int Page { get; init; }
        public int PageSize { get; init; }
        public int TotalPages { get; init; }
    }
}
