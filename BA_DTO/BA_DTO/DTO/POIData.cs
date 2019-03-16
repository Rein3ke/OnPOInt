[System.Serializable]
public class POIData
{
    public int ID;
    public string Name;
    public string Description;
    public string[] ImagePath;
    public string[] Links;

    public POIData() { }
    public POIData(int _ID, string _name, string _description, string[] _images, string[] _links)
    {
        ID          = _ID;
        Name        = _name;
        Description = _description;
        ImagePath   = _images;
        Links       = _links;
    }
}

[System.Serializable]
public class POIDataSet
{
    public POIData[] Data;

    public POIDataSet() { }
    public POIDataSet(POIData[] _data)
    {
        Data        = _data;
    }
}