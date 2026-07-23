using System.Text.Json.Serialization;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Shared
{
    public class Pagination
    {
        public int PageNumber { get; init; }
        public int PageSize { get; init; }
        public int TotalCount { get; init; }
        public int TotalPages { get; init; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        [JsonConstructor]
        public Pagination(int pageNumber, int pageSize, int totalCount, int totalPages)
        {
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalCount = totalCount;
            TotalPages = totalPages;
        }

        public Pagination(int pageNumber, int pageSize, int totalCount)
        {
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalCount = totalCount;
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        }
    }

    public class PagedResult<T> : Result
    {
        public List<T> Data { get; init; }
        public Pagination Pagination { get; init; }

        [JsonConstructor]
        public PagedResult(bool isSuccess, string message, List<T> data, Pagination pagination)
            : base(isSuccess, message)
        {
            Data = data;
            Pagination = pagination;
        }

        public static PagedResult<T> Success(List<T> data, Pagination pagination, string message = "Success")
            => new(true, message, data, pagination);

        public new static PagedResult<T> Failure(string message)
            => new(false, message, new List<T>(), new Pagination(0, 0, 0, 0));
    }
}
