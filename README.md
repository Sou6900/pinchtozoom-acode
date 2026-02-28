<div style="display:flex;align-items:center;background: linear-gradient(to right, #121212, #1e1e2f);padding:10px;height:40px;margin:0 ;">
  <img src="https://i.postimg.cc/QC7Dv1j0/Picsart-25-10-25-14-37-24-955-1.png" alt="Colors Icon" style="width:40px;margin-right:10px;"><h1><span style="background: linear-gradient(135deg, #49aaff   , #2662c5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
  ">Pinch ২ Zoom</span><sup style="font-size:0.6rem;font-weight:300;color:#a3a7ff;padding:0 0 0 5px;">Ready to Zoom</sup>
  </h1>

  <div style="margin-left:auto;display:flex;flex-direction:column;gap:5px;">
    <small style="font-size:0.6em;color:#0098e6;">v2.2.2</small>
    <small style="font-size:0.6em;color:#57fd35;">Stable</small>
  </div>
</div>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.2.2-blue?style=for-the-badge">
  
  <img src="https://img.shields.io/badge/size-52.15KB-red?style=for-the-badge">
  
  <img src="https://img.shields.io/badge/zoom-pinch-red?style=for-the-badge">
  
  </p>

## <span class="section-title"> <svg class="svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#1f2937" stroke-width="1.5"/><path d="M8 8h8" stroke="#1f2937" stroke-width="1.5" stroke-linecap="round"/></svg> Quick overview</span>

Pinch-to-Zoom adds natural two-finger zooming to Acode editors. It:

* Shows a centered **zoom bubble** while pinching.
* Applies font size changes live and preserves scroll position relative to the code.
* Supports three **zoom modes**: <span class="ptz-keyword">savePerFile</span>, <span class="ptz-keyword">sharedZoom</span>, <span class="ptz-keyword">customDefault</span>.
* Includes a **UI Modal** to set strictly enforced Minimum & Maximum zoom limits.
* Optionally **highlights pinned rows** (useful to mark current row while zooming).

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18v4" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="7" stroke="#111827" stroke-width="1.6" fill="none"/></svg> Features</span>

* <span class="ptz-feature">Pinch zoom</span> — two-finger pinch to change editor font-size.
* <span class="ptz-feature">Zoom Limits UI</span> — **New!** Dedicated floating modal to set Min/Max font sizes with validation.
* <span class="ptz-feature">Zoom bubble</span> — a transient centered bubble showing current font size while zooming.
* <span class="ptz-feature">Per-file memory</span> — store zoom levels per file in `zoom_data.json`.
* <span class="ptz-feature">Shared zoom</span> — apply zoom level to the app default (updates global `fontSize` in app settings).
* <span class="ptz-feature">Custom default</span> — don't persist changes; a custom default zoom can be set instead.
* <span class="ptz-feature">Row highlight (pin)</span> — pin the current row(s) to the gutter while zooming (configurable up to 4 rows).

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6 6 .5-4.5 3.5L18 20 12 16 6 20l1.5-7.99L3 8.5 9 8 12 2z" stroke="#0f172a" stroke-width="1.2" fill="none"/></svg> Usage</span>

* With the plugin **enabled**, use two fingers on the editor viewport and pinch in/out.
* **Setting Limits:** Go to Plugin Settings and click **"Configure Font Size Limits"**. A modal will appear where you can define the minimum (e.g., 8px) and maximum (e.g., 50px) zoom levels.
* If `zoomMode` is <span class="ptz-keyword">savePerFile</span>, the final size is saved per file and restored when that file is reopened.
* If `zoomMode` is <span class="ptz-keyword">sharedZoom</span>, the plugin updates the global app settings (`appSettings.value.fontSize`).

The plugin ensures the viewport scroll position remains consistent during scaling (keeps the same relative line near the center).

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 17h16" stroke="#111827" stroke-width="1.4" stroke-linecap="round"/></svg> settings.json example</span>

Below is a recommended `settings.json` snippet showing keys, default values and short descriptions.

<br>

```json
{
  "pinchToZoom.pluginEnabled": true,
  "pinchToZoom.zoomMode": "savePerFile",
  "pinchToZoom.customDefaultZoom": 12,
  "pinchToZoom.minZoom": 8,
  "pinchToZoom.maxZoom": 50,
  "pinchToZoom.maxHighlightRows": 4
}

```

### Setting details

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `pluginEnabled` | boolean | `true` | Enable / disable the plugin globally. |
| `zoomMode` | string | `"savePerFile"` | `"savePerFile"`, `"sharedZoom"`, or `"customDefault"`. Controls persistence behavior. |
| `customDefaultZoom` | number | `12` | Font-size to use when `customDefault` mode is selected. Treated as `px`. |
| `minZoom` | number | `8` | **New:** Absolute minimum font size allowed (px). |
| `maxZoom` | number | `50` | **New:** Absolute maximum font size allowed (px). |
| `maxHighlightRows` | number | `4` | Maximum number of gutter rows to highlight. `0` disables highlighting. Allowed range `0-4`. |

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6 6 .5-4.5 3.5L18 20 12 16 6 20l1.5-7.99L3 8.5 9 8 12 2z" stroke="#0f172a" stroke-width="1.2" fill="none"/></svg> Tips & recommended defaults</span>

* **Limit Safety:** The settings modal prevents setting `Min >= Max`. It also enforces a hard safety floor of `8px` and ceiling of `50px`.
* Recommended `zoomMode`: <span class="ptz-keyword">savePerFile</span> — best UX for different file types and users.
* Keep `customDefaultZoom` between `10` and `18` for readable defaults.

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M12 18v4M5 7l7 10 7-10" stroke="#0f172a" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg> Known limitations</span>

* Pinch detection uses browser `touch` events — behavior may vary across some Android WebViews.
* If Acode or another plugin overrides `appSettings.value.fontSize` concurrently, `sharedZoom` may appear to flicker.
* `zoom_data.json` read/write relies on Acode `fs` APIs; permission or storage problems may cause failures.

---

## <span class="section-title"><svg class="svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 6 6 .5-4.5 3.5L18 20 12 16 6 20l1.5-7.99L3 8.5 9 8 12 2z" stroke="#0f172a" stroke-width="1.2" fill="none"/></svg> Contributing</span>

* Not available for this time
* Watch on github : used modded (colored debug , clear logs , direct code & pre ready skeleton ) acode plugin template [Acode Template](https://github.com/Sou6900/Acode_Template)

---

# Contact & Support

<span style="vertical-align:middle; display:inline-flex; align-items:center; gap:0.6rem;">
<svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
<defs>
<linearGradient id="tgGrad" x1="0" x2="1" y1="0" y2="1">
<stop offset="0" stop-color="#2AABEE"/>
<stop offset="1" stop-color="#229ED9"/>
</linearGradient>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0b2a43" flood-opacity="0.12"/>
</filter>
</defs>
<g filter="url(#shadow)">
<circle cx="24" cy="24" r="20" fill="url(#tgGrad)"/>
</g>
<path d="M16.8 24.7l5.6-2.1 2.5 2.4c.3.3.7.5 1 .6.6.2 1.2.1 1.6-.1.6-.3 1-1 1-1.8 0-.7-.3-1.4-.9-2.1l-9.1-8.6c-.5-.5-1.2-.7-1.9-.6-.8.1-1.4.6-1.8 1.2L8.7 21.6c-.6.9-.2 2.1.8 2.6 1.1.6 2.5.2 3.4-0.6l2.9-2.4z" fill="#ffffff" opacity="0.95"/>
<path d="M15.6 28.4l8.2-6.3" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
</svg>
<span style="font-weight:600; color:#0f172a;">Contact & Support</span> <a href="https://t.me/sourav0chand">TELEGRAM</a>
</span>
