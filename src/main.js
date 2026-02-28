// src/main.js
import plugin from '../plugin.json';
import { initializePlugin, handleSettingsChange, destroyPluginHandlers } from './initPlugin.js';
import { getSettingsList, onSettingsChange, getSettings } from './settings.js';

const appSettings = acode.require('settings');

class PinchToZoomerPlugin {
    
    constructor() {
        this.settings = getSettings(); 
        this.highlighter = null;
        this.isInitialized = false; // Track if handlers are active
    }

    async init() {
        // 1. Check if plugin is enabled in settings
        this.settings = getSettings(); // Refresh settings
        if (!this.settings.pluginEnabled) {
            return; // Do not initialize if disabled
        }
        
        // 2. Prevent double initialization
        if (this.isInitialized) return;

        // 3. Initialize handlers
        const handlers = await initializePlugin(); 
        if (handlers) {
             this.highlighter = handlers.highlighterHandler;
             this.isInitialized = true;
        }
    }

    destroy() {
        // Destroy all handlers
        destroyPluginHandlers();
        this.highlighter = null;
        this.isInitialized = false;
    }
    
    get settingsList() {
        return getSettingsList();
    }  
    
    
    
    onSettingsChange(key, value) {
       // Call function from settings.js
       const changedKey = onSettingsChange(key, value);
       
       if (changedKey === 'pluginEnabled') {
           if (value === true) {
               // Plugin was just enabled
               this.init();
           } else {
               // Plugin was just disabled
               this.destroy();
               // Reset zoom to app default
               const defaultZoom = parseInt(appSettings.value.fontSize.replace("px", "")) || 12;
               if (editorManager.editor) {
                   editorManager.editor.setFontSize(defaultZoom);
               }
           }
       } else if (this.isInitialized) {
            // If plugin is active, notify handlers of the change
            handleSettingsChange();
       }
    }
}

if (window.acode) {
    const pluginInstance = new PinchToZoomerPlugin();
    
    acode.setPluginInit(
        plugin.id,
        async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
            await pluginInstance.init(); 
        },
        {
            list: pluginInstance.settingsList,
            cb: pluginInstance.onSettingsChange.bind(pluginInstance)
        }
    );
    
    acode.setPluginUnmount(plugin.id, () => {
        pluginInstance.destroy();
    });
}