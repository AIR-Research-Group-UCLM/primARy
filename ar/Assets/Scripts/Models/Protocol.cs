using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class Protocol
{
    public string id;
    public string name;
    public string initialNodeId;
    public List<Node> nodes;
    public List<Edge> edges;

    public static Protocol CreateFromJSON(string jsonString)
    {
        return JsonUtility.FromJson<Protocol>(jsonString);
    }
}
