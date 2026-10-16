using TMPro;
using UnityEngine;

namespace ClaudeGame.UI
{
    /// <summary>Temporary boot check label: shows "Boot OK" plus version. Remove once a real main menu exists.</summary>
    [RequireComponent(typeof(TextMeshProUGUI))]
    public sealed class BootStatusText : MonoBehaviour
    {
        void Start()
        {
            GetComponent<TextMeshProUGUI>().SetText($"Boot OK\n<size=40%>v{Application.version}</size>");
        }
    }
}
