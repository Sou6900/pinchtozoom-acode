// src/settings.js
import plugin from '../plugin.json';
const appSettings = acode.require('settings');

// Default settings
const defaultSettings = {
    pluginEnabled: true,
    maxHighlightRows: 0,
    zoomMode: 'savePerFile', 
    customDefaultZoom: 12,
    minZoom: 8,
    maxZoom: 50
};

// Initialize settings
export function getSettings() {
    const pluginId = plugin.id;
    let settings = appSettings.value[pluginId];
    
    if (!settings) {
        appSettings.value[pluginId] = { ...defaultSettings };
        appSettings.update(false);
        settings = appSettings.value[pluginId];
    } else {
        let updated = false;
        for (const key in defaultSettings) {
            if (!(key in settings)) {
                settings[key] = defaultSettings[key];
                updated = true;
            }
        }
        for (const key in settings) {
            if (!(key in defaultSettings)) {
                delete settings[key];
                updated = true;
            }
        }
        if (updated) appSettings.update(false);
    }
    
    return settings;
}

// floating modal
function showZoomLimitsModal() {
    const settings = getSettings();
    let currentMin = settings.minZoom;
    let currentMax = settings.maxZoom;

    // 1. Create Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5); z-index: 9998;
        display: flex; justify-content: center; align-items: center;
    `;

    // 2. Create Modal Container
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: var(--primary-color);
        color: var(--primary-text-color);
        width: 80%; max-width: 350px;
        padding: 20px; border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 1px solid var(--border-color);
        z-index: 9999; display: flex; flex-direction: column; gap: 15px;
    `;

    // 3. Title
    const title = document.createElement('h3');
    title.textContent = "Set Zoom Limits";
    title.style.margin = "0 0 10px 0";
    title.style.color = "var(--primary-text-color)";

    // 4. Input Helper Function
    const createInputGroup = (labelText, value, onChange) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "5px";

        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.fontSize = "14px";
        label.style.opacity = "0.8";

        const input = document.createElement('input');
        input.type = "number";
        input.value = value;
        input.style.cssText = `
            background: transparent;
            color: var(--primary-text-color);
            border: none;
            border-bottom: 1px solid var(--border-color);
            padding: 8px 0;
            outline: none;
            font-size: 16px;
        `;
        
        input.onfocus = () => input.style.borderBottomColor = "var(--primary-color)";
        input.onblur = () => input.style.borderBottomColor = "var(--border-color)";
        input.oninput = (e) => onChange(e.target.value);

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return wrapper;
    };

    // 5. Validation Error Text
    const errorText = document.createElement('small');
    errorText.textContent = "";
    errorText.style.cssText = `
        color: red;
        font-style: italic;
        font-size: 12px;
        display: none;
        margin-top: -5px;
    `;

    // 6. Buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = "display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;";

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
        background: transparent; border: none;
        color: var(--primary-text-color);
        padding: 8px 16px; font-weight: bold;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = `
        background: var(--button-background-color);
        color: white; 
        background-color: var(--primary-color);
        border: none;
        padding: 8px 20px; border-radius: 4px;
        font-weight: bold;
    `;

    // 7. Logic & Assembly
    const validate = () => {
        let isValid = true;
        let message = "";

        if (currentMin < 8) {
            isValid = false;
            message = "Minimum limit cannot be less than 8px";
        } else if (currentMax > 50) {
            isValid = false;
            message = "Maximum limit cannot be greater than 50px";
        } else if (currentMin >= currentMax) {
            isValid = false;
            message = "Maximum size must be greater than minimum size";
        }

        if (!isValid) {
            errorText.textContent = message;
            errorText.style.display = "block";
            saveBtn.style.opacity = "0.5";
            saveBtn.disabled = true;
        } else {
            errorText.style.display = "none";
            saveBtn.style.opacity = "1";
            saveBtn.disabled = false;
        }
    };

    modal.appendChild(title);
    modal.appendChild(createInputGroup("Minimum Size (px)", currentMin, (val) => {
        currentMin = parseInt(val) || 0;
        validate();
    }));
    modal.appendChild(createInputGroup("Maximum Size (px)", currentMax, (val) => {
        currentMax = parseInt(val) || 0;
        validate();
    }));
    modal.appendChild(errorText);
    
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(saveBtn);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event Handlers
    cancelBtn.onclick = () => document.body.removeChild(overlay);
    
    saveBtn.onclick = () => {
        // Update Settings
        const settings = getSettings();
        settings.minZoom = currentMin;
        settings.maxZoom = currentMax;
        appSettings.update(false);
        document.body.removeChild(overlay);
        
        if(window.toast) window.toast('Zoom limits updated', 3000);
    };

    // Close on click outside
    overlay.onclick = (e) => {
        if(e.target === overlay) document.body.removeChild(overlay);
    };
}

// Show settings list in Acode's UI
export function getSettingsList() {
    const settings = getSettings();
    return [
        {
            key: 'pluginEnabled',
            text: 'Enable Pinch-to-Zoom',
            checkbox: settings.pluginEnabled,
            info: 'Enable or disable the pinch-to-zoom functionality.'
        },
        {
            key: 'zoomMode',
            text: 'Zoom Behavior',
            value: settings.zoomMode,
            select: [
                ['sharedZoom', "Use Shared Zoom (Updates App Default)"],
                ['savePerFile', "Save Zoom Per File (Recommended)"],
                ['customDefault', "Always Reset to Custom Zoom"]
            ],
            info: 'Choose how zoom levels are handled.'
        },
        {
            key: 'customDefaultZoom',
            text: 'Custom Default Zoom',
            value: settings.customDefaultZoom,
            prompt: 'Enter Custom Zoom Value',
            promptType: 'number',
            info: 'Set the zoom level to use when "Always Reset to Custom Zoom" is selected.'
        },
        {
            key: 'openZoomLimits',
            text: 'Configure Font Size Limits',
            info: `Current: Min ${settings.minZoom}px / Max ${settings.maxZoom}px`,
            // Triggered via onSettingsChange below
        },
        {
            key: "maxHighlightRows",
            text: "Maximum Highlight Rows",
            value: settings.maxHighlightRows,
            prompt: "Enter the maximum number of highlight rows (0-4):",
            promptType: "number",
            info: "Set the maximum number of highlighted rows (0 = no highlights, 1-4 = limit highlights to these rows).",
        },
    ];
}

// This function will be called when settings change
export function onSettingsChange(key, value) {
    const settings = getSettings();
    
    if(key === "openZoomLimits"){
        showZoomLimitsModal();
    }
    
    if (key === "maxHighlightRows") {
        settings[key] = Math.min(4, Math.max(0, parseInt(value, 10) || 0));
    } else if (key === 'customDefaultZoom') {
        settings[key] = parseInt(value, 10) || 12;
    } else {
        settings[key] = value;
    }
    
    appSettings.update(false);
    return key;
}