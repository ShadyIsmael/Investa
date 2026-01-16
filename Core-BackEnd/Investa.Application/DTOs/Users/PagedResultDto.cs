using System.Collections.Generic;
using System.Linq;

namespace Investa.Application.DTOs.Users
{
    public class PagedResultDto<T>
    {
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}