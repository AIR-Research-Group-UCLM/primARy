using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class FileCollection
{
    public List<File> files;

    public static List<File> CreateFromJSON(string jsonString)
    {
        string wrappedJson = $"{{\"files\":{jsonString}}}";
        var protocolCollection = JsonUtility.FromJson<FileCollection>(wrappedJson);
        return protocolCollection.files;
    }
}
