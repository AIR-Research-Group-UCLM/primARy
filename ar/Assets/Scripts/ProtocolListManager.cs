using System.Collections.Generic;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using TMPro;
using UnityEngine.UI;

public class ProtocolListManager: MonoBehaviour
{
    public string apiBase;

    public UIManager uiManager;

    public GameObject listItem;
    public GameObject container;

    void OnEnable()
    {
        StartCoroutine(MakeRequest());
    }

    void AddProtocols(List<ProtocolSummary> protocols)
    {
        DeleteAllProtocols();
        foreach (var protocol in protocols)
        {
            var protocolItem = Instantiate(listItem, container.transform);
            protocolItem.GetComponentInChildren<TextMeshProUGUI>().text = protocol.name;
            protocolItem
                .GetComponentInChildren<Button>()
                .onClick.AddListener(() => uiManager.OnProtocolLaunchClick(protocol));
        }
    }

    void DeleteAllProtocols()
    {
        foreach (Transform child in container.transform)
        {
            Destroy(child.gameObject);
        }
    }

    IEnumerator MakeRequest()
    {
        using var request = UnityWebRequest.Get($"{apiBase}/protocols");
        yield return request.SendWebRequest();

        if (request.error != null)
        {
            Debug.LogError($"Network error: {request.error}");
            yield break;
        }

        string text = request.downloadHandler.text;
        var protocols = ProtocolSummaryCollection.CreateFromJSON(text);
        AddProtocols(protocols);
    }

}
