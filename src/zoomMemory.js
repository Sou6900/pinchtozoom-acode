// src/zoomMemory.js
import plugin from '../plugin.json';

// Acode requires
const fs = acode.require('fs');
const Url = acode.require('Url');

// Path to the data file
const PLUGIN_DATA_DIR = Url.join(DATA_STORAGE, plugin.id);
const ZOOM_DATA_FILE_PATH = Url.join(PLUGIN_DATA_DIR, 'zoom_data.json');

// In-memory cache for zoom data
let zoomDataCache = {};

/**
 * Loads the zoom data from the JSON file into the cache.
 * Creates the file if it doesn't exist.
 */
export async function loadZoomData() {
    try {
        const dirExists = await fs(PLUGIN_DATA_DIR).exists();
        if (!dirExists) {
            await fs(DATA_STORAGE).createDirectory(plugin.id);
        }
        
        const fileExists = await fs(ZOOM_DATA_FILE_PATH).exists();
        if (!fileExists) {
            await fs(PLUGIN_DATA_DIR).createFile('zoom_data.json', '{}');
            zoomDataCache = {};
        } else {
            const content = await fs(ZOOM_DATA_FILE_PATH).readFile('utf-8');
            zoomDataCache = JSON.parse(content || '{}');
        }
    } catch (err) {
        console.error('[PinchToZoom] Error loading zoom data:', err);
        zoomDataCache = {}; // Reset cache on error
    }
}

/**
 * Saves the entire zoom data cache back to the JSON file.
 * This is async, but we don't need to wait for it.
 */
async function saveZoomData() {
    try {
        const content = JSON.stringify(zoomDataCache, null, 2);
        await fs(ZOOM_DATA_FILE_PATH).writeFile(content);
    } catch (err) {
        console.error('[PinchToZoom] Error saving zoom data:', err);
    }
}

/**
 * Gets the saved zoom level for a specific file URI.
 * @param {string} fileUri - The unique URI of the file.
 * @returns {number | null} - The saved zoom level or null if not found.
 */
export function getFileZoom(fileUri) {
    if (!fileUri) return null;
    return zoomDataCache[fileUri] || null;
}

/**
 * Sets the zoom level for a specific file URI and saves the data.
 * @param {string} fileUri - The unique URI of the file.
 * @param {number} zoomLevel - The new zoom level to save.
 */
export function setFileZoom(fileUri, zoomLevel) {
    if (!fileUri) return;
    
    // Save to cache
    zoomDataCache[fileUri] = zoomLevel;
    
    // Asynchronously save to file (no need to 'await')
    saveZoomData();
}