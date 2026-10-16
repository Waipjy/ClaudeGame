using ClaudeGame.Core;
using UnityEngine;

namespace ClaudeGame.Game
{
    /// <summary>
    /// Keeps a fixed world-space reference area (default 19.2 x 10.8 units = 16:9) fully visible
    /// on any aspect ratio (16:9, 16:10 Steam Deck, 21:9, resizable window).
    /// Expand: extra area shows more world/background. Letterbox: extra area is black bars.
    /// Does NOT use Pixel Perfect Camera (art style undecided, see docs/tech/PROJECT_SETUP.md).
    /// </summary>
    [ExecuteAlways]
    [RequireComponent(typeof(Camera))]
    public sealed class CameraFit : MonoBehaviour
    {
        [Tooltip("World units that must always be visible (width).")]
        [SerializeField] float referenceWidth = 19.2f;
        [Tooltip("World units that must always be visible (height).")]
        [SerializeField] float referenceHeight = 10.8f;
        [SerializeField] FitMode mode = FitMode.Expand;
        [Tooltip("Colour of the bars in Letterbox mode.")]
        [SerializeField] Color barColor = Color.black;

        Camera _cam;
        Camera _barCam;
        int _lastW, _lastH;
        FitMode _lastMode;
        float _lastRefW, _lastRefH;

        public FitMode Mode { get => mode; set { mode = value; Apply(); } }
        public float ReferenceWidth => referenceWidth;
        public float ReferenceHeight => referenceHeight;

        void OnEnable() { _cam = GetComponent<Camera>(); Apply(); }

        void OnDisable()
        {
            if (_cam != null) _cam.rect = new Rect(0, 0, 1, 1);
            DestroyBarCamera();
        }

        void OnValidate() { _lastW = -1; }

        void LateUpdate()
        {
            if (Screen.width != _lastW || Screen.height != _lastH || mode != _lastMode
                || referenceWidth != _lastRefW || referenceHeight != _lastRefH)
                Apply();
        }

        public void Apply()
        {
            if (_cam == null) _cam = GetComponent<Camera>();
            _lastW = Screen.width; _lastH = Screen.height; _lastMode = mode;
            _lastRefW = referenceWidth; _lastRefH = referenceHeight;

            var fit = AspectFit.Compute(referenceWidth, referenceHeight, _lastW, _lastH, mode);
            _cam.orthographic = true;
            _cam.orthographicSize = fit.OrthographicSize;
            _cam.rect = new Rect(fit.ViewportX, fit.ViewportY, fit.ViewportWidth, fit.ViewportHeight);

            bool needBars = mode == FitMode.Letterbox && (fit.ViewportWidth < 0.9999f || fit.ViewportHeight < 0.9999f);
            if (needBars && Application.isPlaying) EnsureBarCamera();
            else DestroyBarCamera();
        }

        // A full-screen camera that renders nothing but clears to barColor, drawn before the main camera,
        // so the area outside the main camera's viewport is not left uncleared.
        void EnsureBarCamera()
        {
            if (_barCam == null)
            {
                var go = new GameObject("LetterboxBars") { hideFlags = HideFlags.DontSave };
                go.transform.SetParent(transform, false);
                _barCam = go.AddComponent<Camera>();
                _barCam.cullingMask = 0;
                _barCam.orthographic = true;
                _barCam.clearFlags = CameraClearFlags.SolidColor;
                _barCam.depth = _cam.depth - 100;
            }
            _barCam.backgroundColor = barColor;
            _barCam.rect = new Rect(0, 0, 1, 1);
        }

        void DestroyBarCamera()
        {
            if (_barCam == null) return;
            if (Application.isPlaying) Destroy(_barCam.gameObject); else DestroyImmediate(_barCam.gameObject);
            _barCam = null;
        }

        void OnDrawGizmos()
        {
            Gizmos.color = new Color(1f, 0.8f, 0.2f, 0.8f);
            Gizmos.DrawWireCube(new Vector3(transform.position.x, transform.position.y, 0f),
                new Vector3(referenceWidth, referenceHeight, 0f));
        }
    }
}
