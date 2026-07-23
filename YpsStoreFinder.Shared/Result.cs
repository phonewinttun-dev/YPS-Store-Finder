using System.Text.Json.Serialization;

namespace YpsStoreFinder.Shared
{
    public class Result
    {
        public bool IsSuccess { get; init; }
        public string Message { get; init; }
        public bool IsFailure => !IsSuccess;

        [JsonConstructor]
        public Result(bool isSuccess, string message)
        {
            IsSuccess = isSuccess;
            Message = message;
        }

        public static Result Success(string message = "Success") => new(true, message);
        public static Result Failure(string message) => new(false, message);
    }

    public class Result<T> : Result
    {
        public T? Data { get; init; }

        [JsonConstructor]
        public Result(bool isSuccess, string message, T? data) : base(isSuccess, message)
        {
            Data = data;
        }

        public static Result<T> Success(T data, string message = "Success") => new(true, message, data);
        public new static Result<T> Failure(string message) => new(false, message, default);
    }
}
