using UnityEngine;

namespace ClaudeGame.Game
{
    /// <summary>
    /// Composition root of Boot.unity. Gameplay-agnostic basic initialization only:
    /// frame pacing, logging build/version info. Gameplay systems get wired here later.
    /// </summary>
    [DefaultExecutionOrder(-1000)]
    public sealed class GameBootstrap : MonoBehaviour
    {
        public const int MinTargetFps = 60;

        public static GameBootstrap Instance { get; private set; }

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            ApplyFramePacing();
            Debug.Log($"[Boot] {Application.productName} v{Application.version} | Unity {Application.unityVersion} | " +
                      $"{Application.platform} | {SystemInfo.graphicsDeviceType} | " +
                      $"{Screen.width}x{Screen.height} {Screen.fullScreenMode} | " +
                      $"Quality={QualitySettings.names[QualitySettings.GetQualityLevel()]} vSync={QualitySettings.vSyncCount} " +
                      $"targetFps={Application.targetFrameRate}");
        }

        /// <summary>
        /// VSync on (default): targetFrameRate is ignored by Unity on desktop, leave it -1.
        /// VSync off: cap at the display refresh rate (at least 60) to avoid burning GPU / fan noise on Steam Deck.
        /// </summary>
        public static void ApplyFramePacing()
        {
            if (QualitySettings.vSyncCount > 0)
            {
                Application.targetFrameRate = -1;
            }
            else
            {
                int hz = Mathf.RoundToInt((float)Screen.currentResolution.refreshRateRatio.value);
                Application.targetFrameRate = Mathf.Max(MinTargetFps, hz > 0 ? hz : MinTargetFps);
            }
        }

        void OnDestroy() { if (Instance == this) Instance = null; }
    }
}
