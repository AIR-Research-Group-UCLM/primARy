using UnityEngine;

[System.Serializable]
public class ProtocolSummary
{
    public string id;
    public string name;

    public static ProtocolSummary CreateFromJSON(string jsonString)
    {
        return JsonUtility.FromJson<ProtocolSummary>(jsonString);
    }
}
