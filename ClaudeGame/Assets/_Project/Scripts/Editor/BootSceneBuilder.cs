using System.Linq;
using ClaudeGame.Game;
using ClaudeGame.UI;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace ClaudeGame.EditorTools
{
    /// <summary>
    /// Code-first generator for Boot.unity (idempotent: rebuilds the scene from scratch).
    /// Run: menu ClaudeGame/Rebuild Boot Scene, or eval ClaudeGame.EditorTools.BootSceneBuilder.Build();
    /// Do not hand-edit Boot.unity; change this script and re-run it.
    /// </summary>
    public static class BootSceneBuilder
    {
        public const string ScenePath = "Assets/_Project/Scenes/Boot.unity";
        public static readonly Color BackgroundColor = new Color(0.10f, 0.105f, 0.115f, 1f); // dark neutral

        [MenuItem("ClaudeGame/Rebuild Boot Scene")]
        public static void Build()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // --- Bootstrap root
            var root = new GameObject("GameRoot");
            root.AddComponent<GameBootstrap>();

            // --- Camera (URP 2D renderer is the only renderer in the URP asset)
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" };
            camGo.transform.position = new Vector3(0f, 0f, -10f);
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 5.4f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = BackgroundColor;
            cam.nearClipPlane = 0.3f; cam.farClipPlane = 100f;
            var urpCam = camGo.AddComponent<UniversalAdditionalCameraData>();
            urpCam.renderPostProcessing = false;
            camGo.AddComponent<CameraFit>();

            // --- UI canvas
            var canvasGo = new GameObject("UICanvas", typeof(RectTransform));
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 0;
            var scaler = canvasGo.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;
            canvasGo.AddComponent<GraphicRaycaster>();

            var textGo = new GameObject("BootStatus", typeof(RectTransform));
            textGo.transform.SetParent(canvasGo.transform, false);
            var rt = (RectTransform)textGo.transform;
            rt.anchorMin = rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.sizeDelta = new Vector2(800, 300);
            var tmp = textGo.AddComponent<TextMeshProUGUI>();
            tmp.text = "Boot OK";
            tmp.fontSize = 96;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = new Color(0.85f, 0.9f, 0.85f, 1f);
            textGo.AddComponent<BootStatusText>();

            // --- EventSystem with Input System UI module
            var esGo = new GameObject("EventSystem");
            esGo.AddComponent<EventSystem>();
            var module = esGo.AddComponent<InputSystemUIInputModule>();
            module.AssignDefaultActions();

            EditorSceneManager.SaveScene(scene, ScenePath);
            SetBuildScenes();
            Debug.Log("[BootSceneBuilder] Built " + ScenePath);
        }

        /// <summary>Boot.unity is build index 0 and the only scene for now.</summary>
        public static void SetBuildScenes()
        {
            var others = EditorBuildSettings.scenes
                .Where(s => s.path != ScenePath && !s.path.EndsWith("SampleScene.unity"));
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) }
                .Concat(others).ToArray();
        }
    }
}
