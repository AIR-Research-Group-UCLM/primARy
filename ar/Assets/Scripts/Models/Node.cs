
[System.Serializable]
public class Node
{
    [System.Serializable]
    public class Data
    {
        public string name;
        public string description;
    }

    public string id;
    public Position position;
    public Data data;

}
