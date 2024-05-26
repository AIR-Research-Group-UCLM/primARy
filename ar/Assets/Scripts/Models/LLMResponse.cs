using UnityEngine;

[System.Serializable]
public class LLMResponse
{
    public string text;
     public static LLMResponse CreateFromJSON(string jsonString)
    {
        return JsonUtility.FromJson<LLMResponse>(jsonString);
    }

}
