using UnityEngine;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

public class ProtocolFlow
{
    private Dictionary<string, Node> _nodes;
    private Dictionary<string, List<Edge>> _edges;
    private Stack<ProtocolStep> _previousSteps = new();

    public ProtocolStep CurrentStep { get; private set; }
    public string Id { get; private set; }

    public ProtocolFlow(Protocol protocol)
    {
        _nodes = protocol.nodes.ToDictionary((node) => node.id);

        _edges = protocol.edges
            .GroupBy((edge) => edge.source)
            .ToDictionary((group) => group.Key, (group) => group.ToList());

        var empty = new List<Edge>();
        foreach (Node node in protocol.nodes)
        {
            _edges.TryAdd(node.id, empty);
        }

        CurrentStep = ConvertNodeToStep(protocol.initialNodeId);
        Id = protocol.id;
    }

    public bool IsCurrentStepFirst() 
    {
        return _previousSteps.Count == 0;
    }

    public ProtocolStep BackToPreviousStep()
    {
        CurrentStep = !IsCurrentStepFirst() ? _previousSteps.Pop() : CurrentStep;
        return CurrentStep;
    }

    // Return the next step for the protocol when the given answer has been 'option'.
    public ProtocolStep GoToStep(string optionLabel = "")
    {
        var currentEdges = _edges[CurrentStep.Id];
        var chosenEdge = currentEdges.Find((edge) => edge.label == optionLabel);

        if (chosenEdge == null)
        {
            throw new InvalidOptionException(
                $"'{optionLabel}' is not a valid option for the step '{_nodes[CurrentStep.Id].data.name}'"
            );
        }

        _previousSteps.Push(CurrentStep);
        CurrentStep = ConvertNodeToStep(chosenEdge.target);
        return CurrentStep;
    }

    private ProtocolStep ConvertNodeToStep(string nodeId)
    {
        var nodeData = _nodes[nodeId].data;
        var options = _edges[nodeId].Select((edge) => edge.label).ToList();
        return new ProtocolStep(nodeId, nodeData.name, nodeData.description, options);
    }
}
