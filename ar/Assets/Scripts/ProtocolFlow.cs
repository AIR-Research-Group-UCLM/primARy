using UnityEngine;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

public class ProtocolFlow
{
    private Dictionary<string, Node> _nodes;
    private Dictionary<string, List<Edge>> _edges;
    private string _currentNodeId;

    public ProtocolStep InitialStep { get; private set; }

    public ProtocolFlow(Protocol protocol)
    {
        // TODO: this should be obtained from the protocol. Update this when the API changes
        string initialNodeId = "0";
        _nodes = protocol.nodes.ToDictionary((node) => node.id);

        _edges = protocol.edges
            .GroupBy((edge) => edge.source)
            .ToDictionary((group) => group.Key, (group) => group.ToList());

        var empty = new List<Edge>();
        foreach (Node node in protocol.nodes)
        {
            _edges.TryAdd(node.id, empty);
        }

        InitialStep = ConvertNodeToStep(initialNodeId);
        _currentNodeId = initialNodeId;
    }

    // Return the next step for the protocol when the given answer has been 'option'.
    public ProtocolStep GetNextStep(string optionLabel = "")
    {
        var currentEdges = _edges[_currentNodeId];
        var chosenEdge = currentEdges.Find((edge) => edge.label == optionLabel);

        if (chosenEdge == null)
        {
            throw new InvalidOptionException(
                $"'{optionLabel}' is not a valid option for the step '{_nodes[_currentNodeId].data.name}'"
            );
        }

        _currentNodeId = chosenEdge.target;
        UnityEngine.Debug.Log($"Se ha elegido: {_currentNodeId}");
        return ConvertNodeToStep(chosenEdge.target);
    }

    private ProtocolStep ConvertNodeToStep(string nodeId)
    {
        var nodeData = _nodes[nodeId].data;
        var options = _edges[nodeId].Select((edge) => edge.label).ToList();
        return new ProtocolStep(nodeData.name, nodeData.description, options);
    }
}
