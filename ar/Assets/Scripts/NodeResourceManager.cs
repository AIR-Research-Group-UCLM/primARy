using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class NodeResourceManager : MonoBehaviour
{
    public string apiBase;

    public TextMeshProUGUI nameField;
    public Image image;

    public GameObject nextButton;
    public GameObject previousButton;
    public GameObject closeButton;

    public GameObject nodeResourceVisualizer;

    private List<File> nodeResources;
    private int currentIndex = 0;


    void Start()
    {
        closeButton.GetComponent<Button>().onClick.AddListener(() => nodeResourceVisualizer.SetActive(false));
        nextButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            currentIndex++;
            UpdateVisualizer();
        });
        previousButton.GetComponent<Button>().onClick.AddListener(() =>
        {
            currentIndex--;
            UpdateVisualizer();
        });
    }

    public void OnVisualizerShown(List<File> files)
    {
        nodeResources = files;
        currentIndex = 0;
        UpdateVisualizer();
    }

    void UpdateVisualizer()
    {
        previousButton.SetActive(currentIndex != 0);
        nextButton.SetActive(currentIndex != nodeResources.Count - 1);

        nameField.text = CurrentNodeResource().name;
        StartCoroutine(GetImage());
    }

    IEnumerator GetImage()
    {
        using var request = UnityWebRequestTexture.GetTexture($"{apiBase}/static/nodes/{CurrentNodeResource().filename}");
        yield return request.SendWebRequest();
 
        if (request.error != null)
        {
            Debug.Log(request.error);
            Debug.Log(request.downloadHandler.error);
            yield break;
        }

        var imgTexture = ((DownloadHandlerTexture)request.downloadHandler).texture;
        var sprite = Sprite.Create(
            imgTexture,
            new Rect(0, 0, imgTexture.width, imgTexture.height),
            new Vector2(.5f, .5f)
       );
        image.sprite = sprite;
        // image.rectTransform.sizeDelta = new Vector2(100, 100);
    }

    private File CurrentNodeResource()
    {
        return nodeResources[currentIndex];
    }
}
