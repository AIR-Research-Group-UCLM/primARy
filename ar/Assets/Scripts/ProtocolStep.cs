using System.Collections.Generic;

public struct ProtocolStep
{
    public string Name { get; }
    public string Description { get; }
    public List<string> Options { get; }

    public ProtocolStep(string name, string description, List<string> options)
    {
        Name = name;
        Description = description;
        Options = options;
    }
}
