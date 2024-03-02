using System;
public class InvalidOptionException: Exception
{
    public InvalidOptionException() : base() { }
    public InvalidOptionException(string message) : base(message) { }
    public InvalidOptionException(string message, Exception inner) : base(message, inner) { }
}
