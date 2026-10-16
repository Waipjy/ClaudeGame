using System;

namespace ClaudeGame.Core
{
    /// <summary>How the fixed reference area is fitted into a screen of arbitrary aspect.</summary>
    public enum FitMode
    {
        /// <summary>Reference area always fully visible; extra space shows more world/background (no bars).</summary>
        Expand = 0,
        /// <summary>Reference area always fully visible; extra space is covered by black bars (letterbox / pillarbox).</summary>
        Letterbox = 1,
    }

    /// <summary>Result of fitting: camera orthographic size + normalized viewport rect (0..1).</summary>
    public readonly struct FitResult
    {
        public readonly float OrthographicSize;
        public readonly float ViewportX, ViewportY, ViewportWidth, ViewportHeight;

        public FitResult(float orthoSize, float x, float y, float w, float h)
        {
            OrthographicSize = orthoSize; ViewportX = x; ViewportY = y; ViewportWidth = w; ViewportHeight = h;
        }

        public override string ToString() =>
            $"ortho={OrthographicSize:0.###} rect=({ViewportX:0.###},{ViewportY:0.###},{ViewportWidth:0.###},{ViewportHeight:0.###})";
    }

    /// <summary>
    /// Pure math (no UnityEngine) for showing a fixed world-space reference area at any aspect ratio.
    /// Used by the CameraFit MonoBehaviour; unit-tested in EditMode.
    /// </summary>
    public static class AspectFit
    {
        public static FitResult Compute(float refWidth, float refHeight, float screenWidth, float screenHeight, FitMode mode)
        {
            if (refWidth <= 0f || refHeight <= 0f) throw new ArgumentOutOfRangeException(nameof(refWidth), "Reference size must be positive.");
            if (screenWidth <= 0f || screenHeight <= 0f)
                return new FitResult(refHeight * 0.5f, 0f, 0f, 1f, 1f); // minimized window etc.

            float refAspect = refWidth / refHeight;
            float screenAspect = screenWidth / screenHeight;

            if (mode == FitMode.Expand)
            {
                // Wider than reference: height limits. Taller than reference: width limits.
                float ortho = screenAspect >= refAspect ? refHeight * 0.5f : refWidth / screenAspect * 0.5f;
                return new FitResult(ortho, 0f, 0f, 1f, 1f);
            }

            // Letterbox: viewport has exactly the reference aspect, centered.
            if (screenAspect > refAspect)
            {
                float w = refAspect / screenAspect;           // pillarbox (e.g. 21:9)
                return new FitResult(refHeight * 0.5f, (1f - w) * 0.5f, 0f, w, 1f);
            }
            else
            {
                float h = screenAspect / refAspect;           // letterbox (e.g. 16:10)
                return new FitResult(refHeight * 0.5f, 0f, (1f - h) * 0.5f, 1f, h);
            }
        }
    }
}
