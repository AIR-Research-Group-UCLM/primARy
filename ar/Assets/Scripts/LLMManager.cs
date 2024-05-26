using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class LLMManager : MonoBehaviour
{
    public string apiBase;

    public GameObject generateButton;
    public TextMeshProUGUI responseContent;

    void Start()
    {

        generateButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            generateButton.SetActive(false);
            responseContent.text = "";

            StartCoroutine(GenerateResponse("Write an essay about Spain"));
        });
    }

    void OnLLMResponseReceived(LLMResponse response)
    {
        Debug.Log(response.text);
        responseContent.text += response.text;
    }

    IEnumerator GenerateResponse(string prompt)
    {
        string body = $"{{\"prompt\":\"{prompt}\"}}";
        using var request = UnityWebRequest.Post($"{apiBase}/llm/generate", body, "application/json");
        request.downloadHandler = new NdJsonDownloadHandler(OnLLMResponseReceived);
        yield return request.SendWebRequest();

        if (request.error != null)
        {
            Debug.LogError($"Network error: {request.error}");
            yield break;
        }

        generateButton.SetActive(true);
    }
}
