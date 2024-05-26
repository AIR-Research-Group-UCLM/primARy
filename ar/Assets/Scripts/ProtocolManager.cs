using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.Events;
using System.Collections.Generic;

public class ProtocolManager : MonoBehaviour
{
    public string apiBase;

    public float resourceVisualizerDistance;
    public float distanceBetweenVisualizers = 0.75f;


    public TextMeshProUGUI titleField;
    public TextMeshProUGUI descriptionField;

    public Transform cameraTransform;
    public Transform protocolVisualizerTransform;

    public GameObject buttonsContainer;

    public GameObject optionButton;
    public GameObject backButton;
    public GameObject closeButton;
    public GameObject resourcesButton;

    public GameObject resourceVisualizer;

    public string defaultNullLabel = "Continue";

    private UIManager uiManager;
    private NodeResourceManager nodeResourceManager;

    private Protocol protocol;
    private List<File> resources;
    private ProtocolFlow protocolFlow;

    void Start()
    {
        uiManager = GetComponent<UIManager>();
        nodeResourceManager = GetComponent<NodeResourceManager>();

        backButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            protocolFlow.BackToPreviousStep();
            ChangeProtocolStep();
        });

        closeButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            uiManager.OnProtocolFlowClose();
            resourceVisualizer.SetActive(false);
        });
        ;
        resourcesButton.GetComponent<Button>().onClick.AddListener(() => OnResourcesButtonClick());
    }

    public void OnLaunchProtocol(ProtocolSummary protocol)
    {
        StartCoroutine(GetProtocol(protocol.id));
    }

    void ChangeProtocolStep()
    {
        StartCoroutine(GetResources());

        resourceVisualizer.SetActive(false);
        backButton.SetActive(!protocolFlow.IsCurrentStepFirst());

        DeleteAllButtons();
        titleField.text = protocolFlow.CurrentStep.Name;
        descriptionField.text = protocolFlow.CurrentStep.Description;

        int optionCount = protocolFlow.CurrentStep.Options.Count;

        if (optionCount > 1)
        {
            foreach (string option in protocolFlow.CurrentStep.Options)
            {
                AddButton(option, () =>
                {
                    protocolFlow.GoToStep(option);
                    ChangeProtocolStep();
                });
            }
        } else if (optionCount == 1)
        {
            string label = protocolFlow.CurrentStep.Options[0];
            string option = label == "" ? defaultNullLabel : label;
            AddButton(option, () =>
            {
                protocolFlow.GoToStep(label);
                ChangeProtocolStep();
            });
        } else
        {
            AddButton("Retry", () => RetryProtocol());
            AddButton("Finish", () => uiManager.OnProtocolFinish());
        }
    }

    void DeleteAllButtons()
    {
        foreach (Transform child in buttonsContainer.transform)
        {
            Destroy(child.gameObject);
        }
        resourcesButton.SetActive(false);
    }

    void OnResourcesButtonClick()
    {
        Vector3 visualizerVector = protocolVisualizerTransform.position - cameraTransform.position;

        float distanceSqr = visualizerVector.sqrMagnitude;
        float cos = 1 - 0.5f * distanceBetweenVisualizers * distanceBetweenVisualizers / distanceSqr;
        float angle = Mathf.Acos(cos) * 180 / Mathf.PI;
        Vector3 visualizerPosition = cameraTransform.position + Quaternion.AngleAxis(angle, Vector3.up) * visualizerVector;

        resourceVisualizer.transform.position = visualizerPosition;
        resourceVisualizer.SetActive(true);

        nodeResourceManager.OnVisualizerShown(resources);
    }

    void AddButton(string text, UnityAction call)
    {
        var button = Instantiate(optionButton, buttonsContainer.transform);
        button.GetComponentInChildren<TextMeshProUGUI>().text = text;
        button.GetComponent<Button>().onClick.AddListener(call);
    }

    IEnumerator GetResources()
    {
        using var request = UnityWebRequest.Get($"{apiBase}/protocols/{protocol.id}/nodes/{protocolFlow.CurrentStep.Id}/resources");
        yield return request.SendWebRequest();

        // TODO: show error message on canvas
        if (request.error != null)
        {
            Debug.LogError($"Network error: {request.error}");
            yield break;
        }

        string text = request.downloadHandler.text;
        resources = FileCollection.CreateFromJSON(text);
        resourcesButton.SetActive(resources.Count > 0);
    }

    IEnumerator GetProtocol(string protocolId)
    {
        using var request = UnityWebRequest.Get($"{apiBase}/protocols/{protocolId}");
        yield return request.SendWebRequest();

        // TODO: show error message on canvas
        if (request.error != null)
        {
            Debug.LogError($"Network error: {request.error}");
            yield break;
        }

        string text = request.downloadHandler.text;
        protocol = Protocol.CreateFromJSON(text);
        RetryProtocol();
    }

    void RetryProtocol()
    {
        protocolFlow = new ProtocolFlow(protocol);
        ChangeProtocolStep();
    }
}
