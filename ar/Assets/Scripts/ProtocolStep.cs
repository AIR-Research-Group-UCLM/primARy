using System.Collections.Generic;

public struct ProtocolStep
{
    public string Id { get; }
    public string Name { get; }
    public string Description { get; }
    public List<string> Options { get; }

    public ProtocolStep(string id, string name, string description, List<string> options)
    {
        Id = id;
        Name = name;
        Description = description;
        Options = options;
    }
}
