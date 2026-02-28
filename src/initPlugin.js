// src/initPlugin.js
import { ZoomHandler } from './zoomHandler.js';
import { HighlighterHandler } from './highlighterHandler.js';
import * as zoomMemory from './zoomMemory.js';
import { getSettings } from './settings.js';

const appSettings = acode.require('settings');

let zoomHandler = null;
let highlighterHandler = null;
const INIT_LISTENER_NAME = 'init-open-file-list-pinch-to-zoom';

// Applies the correct zoom level based on the plugin settings
function applyZoomForFile(file) {
    if (!file || !editorManager.editor) return;

    const settings = getSettings();
    const editor = editorManager.editor;
    
    // --- DUAL SUPPORT CHECK ---
    const isCM6 = typeof editor.dispatch === 'function';
    const isAce = !isCM6; 
    
    const appDefaultZoom = parseInt(appSettings.value.fontSize.replace("px", "")) || 12;
    let targetZoom;

    switch (settings.zoomMode) {
        case 'savePerFile':
            const savedZoom = zoomMemory.getFileZoom(file.uri);
            targetZoom = savedZoom || appDefaultZoom;
            break;
        case 'customDefault':
            targetZoom = settings.customDefaultZoom || 12;
            break;
        case 'sharedZoom':
            targetZoom = appDefaultZoom;
            break;
        default:
            targetZoom = appDefaultZoom;
    }
    
    // Apply Font Size explicitly for Ace
    if (isAce && typeof editor.setFontSize === 'function') {
        editor.setFontSize(targetZoom);
    }
    
    // Update global appSettings 
    const targetZoomString = `${Number(targetZoom).toFixed(1)}px`;
    if (appSettings.value.fontSize !== targetZoomString) {
        appSettings.value.fontSize = targetZoomString;
        appSettings.update(false); // Update without triggering full reload loop
    }
}

export async function initializePlugin() {
    await zoomMemory.loadZoomData();

    if (!editorManager.editor) {
        editorManager.on(INIT_LISTENER_NAME, initializePlugin);
        return null;
    }
    editorManager.off(INIT_LISTENER_NAME, initializePlugin);

    const editor = editorManager.editor;
    const isCM6 = typeof editor.dispatch === 'function';
    
    // Initialize Handlers
    highlighterHandler = new HighlighterHandler(editor);
    
    // Pass the pinner callback only if highlighter is active
    // And ensure we don"t pass it if HighlighterHandler is disabled in CM6
    let pinCallback = null;
    if (highlighterHandler && highlighterHandler.isActive) {
        pinCallback = highlighterHandler.pinCurrentRow.bind(highlighterHandler);
    }
    
    zoomHandler = new ZoomHandler(editor, pinCallback);
    
    applyZoomForFile(editorManager.activeFile);
    
    // Using an arrow function ensures we alwayys pass the current file correctly
    editorManager.on('switch-file', (file) => applyZoomForFile(file || editorManager.activeFile));
    
    return { zoomHandler, highlighterHandler };
}

export function handleSettingsChange() {
    if (highlighterHandler && typeof highlighterHandler.updateRowHighlightStyles === 'function') {
        highlighterHandler.updateRowHighlightStyles();
    }
    applyZoomForFile(editorManager.activeFile);
}

export function destroyPluginHandlers() {
    editorManager.off(INIT_LISTENER_NAME, initializePlugin);
    editorManager.off('switch-file', applyZoomForFile);

    if (zoomHandler) {
        zoomHandler.destroy();
        zoomHandler = null;
    }
    if (highlighterHandler) {
        highlighterHandler.destroy();
        highlighterHandler = null;
    }
}