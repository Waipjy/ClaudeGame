using ClaudeGame.Core;
using NUnit.Framework;

namespace ClaudeGame.Tests
{
    public class AspectFitTests
    {
        const float RefW = 19.2f, RefH = 10.8f, Eps = 1e-4f;

        [Test]
        public void Expand_16x9_UsesHalfReferenceHeight()
        {
            var r = AspectFit.Compute(RefW, RefH, 1920, 1080, FitMode.Expand);
            Assert.AreEqual(5.4f, r.OrthographicSize, Eps);
            Assert.AreEqual(1f, r.ViewportWidth, Eps);
            Assert.AreEqual(1f, r.ViewportHeight, Eps);
        }

        [Test]
        public void Expand_16x10_SteamDeck_ShowsFullWidth()
        {
            var r = AspectFit.Compute(RefW, RefH, 1280, 800, FitMode.Expand);
            // visible width = 2*ortho*aspect must equal reference width
            Assert.AreEqual(RefW, 2f * r.OrthographicSize * (1280f / 800f), Eps);
            Assert.Greater(r.OrthographicSize, RefH * 0.5f);
        }

        [Test]
        public void Expand_21x9_KeepsHeight()
        {
            var r = AspectFit.Compute(RefW, RefH, 2560, 1080, FitMode.Expand);
            Assert.AreEqual(RefH * 0.5f, r.OrthographicSize, Eps);
        }

        [Test]
        public void Letterbox_21x9_Pillarboxes()
        {
            var r = AspectFit.Compute(RefW, RefH, 2560, 1080, FitMode.Letterbox);
            Assert.AreEqual(1920f / 2560f, r.ViewportWidth, Eps);
            Assert.AreEqual((1f - r.ViewportWidth) * 0.5f, r.ViewportX, Eps);
            Assert.AreEqual(1f, r.ViewportHeight, Eps);
        }

        [Test]
        public void Letterbox_16x10_AddsBarsTopBottom()
        {
            var r = AspectFit.Compute(RefW, RefH, 1280, 800, FitMode.Letterbox);
            Assert.AreEqual(1f, r.ViewportWidth, Eps);
            Assert.AreEqual((1280f / 800f) / (16f / 9f), r.ViewportHeight, Eps);
        }

        [Test]
        public void ZeroSizedScreen_DoesNotThrow()
        {
            var r = AspectFit.Compute(RefW, RefH, 0, 0, FitMode.Expand);
            Assert.AreEqual(RefH * 0.5f, r.OrthographicSize, Eps);
        }
    }
}
