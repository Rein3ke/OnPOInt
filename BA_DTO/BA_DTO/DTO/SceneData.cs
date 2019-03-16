[System.Serializable]
public class SceneData
{
    public int ID;
    public string Name;
    public string Description;

    public SceneData() { }
    public SceneData(int _ID, string _name, string _description)
    {
        ID          = _ID;
        Name        = _name;
        Description = _description;
    }
}

[System.Serializable]
public class SceneDataSet
{
    public SceneData[] Data;

    public SceneDataSet() { }
    public SceneDataSet(SceneData[] _data)
    {
        Data        = _data;
    }
}