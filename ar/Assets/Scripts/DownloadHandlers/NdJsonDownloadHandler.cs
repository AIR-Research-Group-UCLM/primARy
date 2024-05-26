using System;
using System.Text;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UIElements;

public class NdJsonDownloadHandler : DownloadHandlerScript
{
    private Action<LLMResponse> _responseHandler;
    private byte[] _byteBuffer;
    public NdJsonDownloadHandler(Action<LLMResponse> responseHandler)
    {
        _responseHandler = responseHandler;
        _byteBuffer = new byte[0];
    }

    protected override bool ReceiveData(byte[] data, int dataLength)
    {
        byte[] combinedData = new byte[_byteBuffer.Length + data.Length];
        _byteBuffer.CopyTo(combinedData, 0);
        data.CopyTo(combinedData, 0);

        long lastNdIndex;
        var jsonStrings = GetJSONStrings(combinedData, out lastNdIndex);
        foreach (string jsonString in jsonStrings)
        {
            _responseHandler(LLMResponse.CreateFromJSON(jsonString));
        }

        if (lastNdIndex != data.Length - 1)
        {
            _byteBuffer = new byte[data.Length - 1 - lastNdIndex];
            Array.Copy(combinedData, lastNdIndex + 1, _byteBuffer, 0, _byteBuffer.Length);
        } else
        {
            _byteBuffer = new byte[0];
        }

        return true;
    }

    private List<string> GetJSONStrings(byte[] data, out long lastNdIndex)
    {
        lastNdIndex = -1;
        List<string> jsonStrings = new();
        for (long i = 0; i < data.Length; i++)
        {
            if (data[i] == 0xA)
            {
                byte[] jsonBytes = new byte[i - lastNdIndex - 1];
                Array.Copy(data, lastNdIndex + 1, jsonBytes, 0, jsonBytes.Length);
                jsonStrings.Add(Encoding.UTF8.GetString(jsonBytes));
                lastNdIndex = i;
            }
        }

        return jsonStrings;
    }
  }
