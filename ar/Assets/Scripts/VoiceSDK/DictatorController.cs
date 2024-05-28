using Meta.WitAi.TTS.Utilities;
using Oculus.Voice.Dictation;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DictatorController : MonoBehaviour
{
    public TTSSpeaker speaker;
    public AppDictationExperience dictationExperience;
    void Start()
    {
        dictationExperience.Activate();

        dictationExperience.AudioEvents.OnMicStartedListening.AddListener(() =>
        {
            Debug.Log("Se ha empezado a grabar");
        });

        dictationExperience.AudioEvents.OnMicStartedListening.AddListener(() =>
        {
            Debug.Log("Se ha desactivado la grabación");
        });
        dictationExperience.TranscriptionEvents.OnPartialTranscription.AddListener((partialTranscription) =>
        {
            Debug.Log("Partial: " + partialTranscription);
        });
        dictationExperience.TranscriptionEvents.OnFullTranscription.AddListener((transcription) =>
        {
            Debug.Log("Full transcription: " + transcription);
        });

    }

    void Update()
    {
        Debug.Log($"IsSpeaking: {speaker.IsSpeaking}");
        Debug.Log($"IsPaused: {speaker.IsPaused}");
    }
}
