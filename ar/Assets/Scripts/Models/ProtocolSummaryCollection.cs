using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class ProtocolSummaryCollection
{
    public List<ProtocolSummary> protocols;

    public static List<ProtocolSummary> CreateFromJSON(string jsonString)
    {
        string wrappedJson = $"{{\"protocols\":{jsonString}}}";
        var protocolCollection = JsonUtility.FromJson<ProtocolSummaryCollection>(wrappedJson);
        return protocolCollection.protocols;
    }
}
