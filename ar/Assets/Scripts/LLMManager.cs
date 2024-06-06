using Meta.WitAi.TTS.Utilities;
using Oculus.Voice.Dictation;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class LLMManager : MonoBehaviour
{
    public string apiBase;

    public GameObject llmCanvas;

    public GameObject generateButton;
    public GameObject closeButton;
    public GameObject stopSpeakingButton;
    public TextMeshProUGUI responseContent;
    public TextMeshProUGUI prompt;
    public Toggle toggleRecording;

    public TTSSpeaker speaker;
    public AppDictationExperience dictationExperience;

    private string protocolId;
    private bool prevIsSpeaking;


    private string partialResponse = "";

    private string PROMPT_INSTRUCTIONS = "Toggle the button and speak";
    private int MAX_WIT_MESSAGE_LEN = 270;

    void Start()
    {
        prompt.text = PROMPT_INSTRUCTIONS;

        generateButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            generateButton.SetActive(false);
            responseContent.text = "";

            StartCoroutine(GenerateResponse(prompt.text));
        });
        stopSpeakingButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            speaker.Stop();
            stopSpeakingButton.SetActive(false);
        });
        closeButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            dictationExperience.Cancel();
            speaker.Stop();
            prevIsSpeaking = false;
            llmCanvas.SetActive(false);
            prompt.text = PROMPT_INSTRUCTIONS;
            responseContent.text = "";
        });

        toggleRecording.onValueChanged.AddListener((value) =>
        {
            if (value)
            {
                dictationExperience.Activate();
                generateButton.SetActive(false);
                prompt.text = "Recording...";
                responseContent.text = "";
            } else
            {
                dictationExperience.Deactivate();
                if (prompt.text == "Recording...")
                {
                    prompt.text = PROMPT_INSTRUCTIONS;
                    generateButton.SetActive(false);
                }
            }
        });

        dictationExperience.TranscriptionEvents.OnFullTranscription.AddListener((transcription) =>
        {
            prompt.text = transcription;
            generateButton.SetActive(true);
            toggleRecording.isOn = false;
        });
        prevIsSpeaking = speaker.IsSpeaking;
    }

    private void Update()
    {
        if (prevIsSpeaking && !speaker.IsSpeaking)
        {
            stopSpeakingButton.SetActive(false);
        }

        if (partialResponse.Length > MAX_WIT_MESSAGE_LEN)
        {
            string firstPart = partialResponse.Substring(0, MAX_WIT_MESSAGE_LEN);
            int spaceIndex = firstPart.LastIndexOf(' ');

            partialResponse = partialResponse.Substring(spaceIndex);
            SpeakIgnoreError(firstPart.Substring(0, spaceIndex));
        }

        prevIsSpeaking = speaker.IsSpeaking;
    }

    public void OnLLMCanvasShown(string protocolId)
    {
        this.protocolId = protocolId;
    }

    void OnLLMResponseReceived(LLMResponse response)
    {
        if (responseContent.text == "Loading...")
        {
            responseContent.text = "";
        }
        responseContent.text += response.text;
        partialResponse += response.text;
    }

    void OnFinishGenerating()
    {
        generateButton.SetActive(true);
        stopSpeakingButton.SetActive(true);
        while (partialResponse.Length >= MAX_WIT_MESSAGE_LEN)
        {
            string firstPart = partialResponse.Substring(0, MAX_WIT_MESSAGE_LEN);
            int spaceIndex = firstPart.IndexOf(' ');

            partialResponse = partialResponse.Substring(spaceIndex);
            SpeakIgnoreError(firstPart.Substring(spaceIndex));
        }
        SpeakIgnoreError(partialResponse);
        partialResponse = "";
    }

    IEnumerator GenerateResponse(string prompt)
    {
        string body = $"{{\"prompt\":\"{prompt}\"}}";
        //using var request = UnityWebRequest.Post($"{apiBase}/llm/generate?protocol={protocolId}", body, "application/json");
        using var request = UnityWebRequest.Post($"{apiBase}/llm/generate", body, "application/json");
        request.downloadHandler = new NdJsonDownloadHandler(OnLLMResponseReceived);
        responseContent.text = "Loading...";
        yield return request.SendWebRequest();

        if (request.error != null)
        {
            responseContent.text = $"Network error: {request.error}";
            yield break;
        }

        OnFinishGenerating();
    }

    void SpeakIgnoreError(string text)
    {
        try
        {
            speaker.SpeakQueued(text);
        } catch(Exception e)
        {
            Debug.Log(e);
        }
    }
}
