using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UIManager : MonoBehaviour
{
    public Transform cameraTransform;
    public float protocolVisualizerDistance = 0.5f;

    public GameObject protocolVisualizer;
    public GameObject protocolList;

    private ProtocolManager protocolManager;

    void Start()
    {
        protocolManager = GetComponent<ProtocolManager>();
    }

    void Update()
    {

    }

    // Called when a user clicks on the button which launches a protocol
    public void OnProtocolLaunchClick(ProtocolSummary protocol)
    {
        protocolVisualizer.SetActive(true);
        protocolList.SetActive(false);

        Vector3 visualizerPosition = cameraTransform.position + cameraTransform.forward * protocolVisualizerDistance;
        protocolVisualizer.transform.position = visualizerPosition;
        protocolManager.OnLaunchProtocol(protocol);
    }

    // Called when the user clicks the close button
    public void OnProtocolFlowClose()
    {
        EnableProtocolSelection();
    }

    // Called when the user has completed a protocol and has pressed the finish button
    public void OnProtocolFinish()
    {
        EnableProtocolSelection();
    }

    public void EnableProtocolSelection()
    {
        protocolVisualizer.SetActive(false);
        protocolList.SetActive(true);
    }

}
