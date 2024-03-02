using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.Events;

public class ProtocolManager : MonoBehaviour
{
    public string apiBase;

    public TextMeshProUGUI titleField;
    public TextMeshProUGUI descriptionField;

    public GameObject buttonsContainer;
    public GameObject optionButton;

    public string defaultNullLabel = "Continue";

    private ProtocolFlow protocolFlow;

    void Start()
    {
        StartCoroutine(MakeRequest());
    }

    void ChangeProtocolStep(ProtocolStep step)
    {
        DeleteAllButtons();
        titleField.text = step.Name;
        descriptionField.text = step.Description;

        int optionCount = step.Options.Count;

        if (optionCount > 1)
        {
            foreach (string option in step.Options)
            {
                AddButton(option, () =>
                {
                    var nextStep = protocolFlow.GetNextStep(option);
                    ChangeProtocolStep(nextStep);
                });
            }
        } else if (optionCount == 1)
        {
            string label = step.Options[0];
            // TODO: change this when the serializer changes
            string option = label == "" ? defaultNullLabel : label;
            AddButton(option, () =>
            {
                var nextStep = protocolFlow.GetNextStep(label);
                ChangeProtocolStep(nextStep);
            });
        } else
        {
            AddButton("Finish", () => Debug.Log("You have finished!!!"));
        }
    }

    void DeleteAllButtons()
    {
        foreach (Transform child in buttonsContainer.transform)
        {
            Destroy(child.gameObject);
        }
    }

    void AddButton(string text, UnityAction call)
    {
        var button = Instantiate(optionButton, buttonsContainer.transform);
        button.GetComponentInChildren<TextMeshProUGUI>().text = text;
        button.GetComponent<Button>().onClick.AddListener(call);
    }

    IEnumerator MakeRequest()
    {
        using var request = UnityWebRequest.Get($"{apiBase}/protocols/100");
        yield return request.SendWebRequest();

        if (request.error != null)
        {
            Debug.LogError($"Network error: {request.error}");
            yield break;
        }

        string text = request.downloadHandler.text;
        //TODO: Unity's serilizer sucks. It fills null values with a default one. Change the
        // serializer being used
        var protocol = Protocol.CreateFromJSON(text);

        protocolFlow = new ProtocolFlow(protocol);
        ChangeProtocolStep(protocolFlow.InitialStep);
    }
}
