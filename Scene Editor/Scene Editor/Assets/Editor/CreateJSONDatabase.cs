using System.IO;
using UnityEditor;
using UnityEngine;

public class CreateJSONDatabase
{
    private const string POI_DATA_PATH          = "Assets/Export/poi_data/poi_lib.json";
    private const string SCENE_DATA_PATH        = "Assets/Export/scene_data/scene_lib.json";

    private const string SCENE_BUNDLES_PATH     = "Assets/Export/scene_bundles";

    [MenuItem("Tools/Create POI sample database")]
    private static void CreatePOIDatabase()
    {
        POIDataSet data = 
        new POIDataSet(
            new []
            {
                new POIData(
                    0, 
                    "Awesome POI", 
                    "So awesome. Really awesome!",
                    new [] 
                    {
                        "test_image"
                    },
                    new []
                    {
                        "https://google.com"
                    }),
                new POIData(
                    1,
                    "Another POI",
                    "Not so awesome. But still quite cool!",
                    new []
                    {
                        "other_test_image"
                    },
                    new []
                    {
                        "https://revvis.com"
                    })
            });

        WriteConfigData(POI_DATA_PATH, data);
        AssetDatabase.Refresh();

        Debug.Log($"POI sample database created @ { POI_DATA_PATH }.");
    }

    [MenuItem("Tools/Create scene sample database")]
    private static void CreateSceneDatabase()
    {
        SceneDataSet data =
        new SceneDataSet(
            new[]
            {
                new SceneData(1, "Szene 1", "Eine wunderbare Szenenbeschreibung für Szene 1!")
            });

        WriteConfigData(SCENE_DATA_PATH, data);
        AssetDatabase.Refresh();

        Debug.Log($"Scene sample database created @ {SCENE_DATA_PATH}.");
    }

    [MenuItem("Tools/Build all scene bundles ...")]
    private static void BuildSceneBundles()
    {
        if(!File.Exists(SCENE_DATA_PATH))
        {
            EditorUtility.DisplayDialog("No!", "Scene data has not been created yet! Please create the scene database before building scene bundles.", "Ok");
            return;
        }

        var datString   = File.ReadAllText(SCENE_DATA_PATH);
        var sceneCfg    = JsonUtility.FromJson<SceneDataSet>(datString);
        if(sceneCfg == null)
        {
            EditorUtility.DisplayDialog("No!", "Failed to read scene data. Please check your scene data file for synthax errors.", "Ok");
            return;
        }

        if (!Directory.Exists(SCENE_BUNDLES_PATH))
            Directory.CreateDirectory(SCENE_BUNDLES_PATH);

        for (int i = 0; i < sceneCfg.Data.Length; ++i)
        {
            var scene = sceneCfg.Data[i];
            var scenePath = $"Assets/Scenes/scene_{scene.ID}.unity";

            if(!File.Exists(scenePath))
            {
                Debug.LogError("Failed to build bundle for scene " + scene.Name + ". Scene does not exist @ " + scenePath);
                continue;
            }

            AssetBundleBuild[] buildConfiguration = new AssetBundleBuild[1];

            buildConfiguration[0].assetBundleName = "scene_" + scene.ID;
            buildConfiguration[0].assetNames = new[] { scenePath };

            try
            {
                EditorUtility.DisplayProgressBar("Building bundles...", $"Building asset bundle for scene " + scene.Name + " ...", i / (float)sceneCfg.Data.Length);
                AssetBundleManifest buildManifest = BuildPipeline.BuildAssetBundles(SCENE_BUNDLES_PATH, buildConfiguration, BuildAssetBundleOptions.StrictMode | BuildAssetBundleOptions.ChunkBasedCompression, BuildTarget.WebGL);
                if (buildManifest == null)
                {
                    EditorUtility.DisplayDialog("Hell nah!", $"Failed to build bundle data for scene {scene.Name}. Check console for errors.", "Ok");
                    return;
                }
            }
            finally
            {
                EditorUtility.ClearProgressBar();
            }
        }
        AssetDatabase.Refresh();
    }
    
    private static void WriteConfigData(string _path, object _data)
    {
        var dir = Path.GetDirectoryName(_path);
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);

        var jString = JsonUtility.ToJson(_data, true);
        File.WriteAllText(_path, jString);
    }
}
