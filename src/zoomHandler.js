// src/zoomHandler.js
import * as zoomMemory from './zoomMemory.js';
import { getSettings } from './settings.js';

const appSettings = acode.require('settings');

export class ZoomHandler {
    constructor(editor, highlightCallback) {
        this.editor = editor;
        this.highlightCallback = highlightCallback;
        
        // Detect Editor Type
        this.isCM6 = typeof this.editor.dispatch === 'function';
        this.isAce = !this.isCM6; 

        if (this.isAce) {
            // Ace Editor Scroller
            this.scroller = this.editor.renderer ? this.editor.renderer.scroller : null;
        } else {
            // Codemirror 6 Scroller
            this.scroller = this.editor.scrollDOM || 
                            this.editor.dom?.querySelector('.cm-scroller') || 
                            this.editor.contentDOM?.parentElement || 
                            this.editor.dom; 
        }
        
        // Safety check
        if (!this.scroller) {
            console.warn("[PinchToZoom] Could not locate editor scroller element.");
            return; 
        }

        this.minFontSize = 8;
        this.maxFontSize = 50;
        
        this.initialDistance = 0;
        this.initialScale = 0;
        this.currentScale = 0; 
        this.initialScrollRatio = 0;
        this.zoomBubble = null;
        
        this.startZoom = this.startZoom.bind(this);
        this.zoom = this.zoom.bind(this);
        this.hideZoomBubble = this.hideZoomBubble.bind(this);
        
        this.initListeners();
    }
    
    initListeners() {
        if (!this.scroller) return;
        this.scroller.addEventListener("touchstart", this.startZoom, { passive: false });
        this.scroller.addEventListener("touchmove", this.zoom, { passive: false });
        this.scroller.addEventListener("touchend", this.hideZoomBubble);
    }

    destroyListeners() {
        if (this.scroller) {
            this.scroller.removeEventListener("touchstart", this.startZoom);
            this.scroller.removeEventListener("touchmove", this.zoom);
            this.scroller.removeEventListener("touchend", this.hideZoomBubble);
        }
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.hypot(dx, dy);
    }

    closeKeyboard() {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
            activeElement.blur();
        }
    }

    getCurrentFontSize() {
        if (this.isAce) {
            // Ace
            return parseInt(this.editor.getFontSize(), 10) || 12;
        } else {
            // cm6
            const globalSize = appSettings.value.fontSize;
            return parseFloat(globalSize) || 12;
        }
    }
    
    setFontSize(size) {
        appSettings.value.fontSize = `${size.toFixed(1)}px`;
        appSettings.update(false);
        if (this.isAce && typeof this.editor.setFontSize === 'function') {
            this.editor.setFontSize(size);
        }
    }

    getScrollRatio() {
        if (this.isAce && this.editor.session) {
            return this.editor.session.getScrollTop() / (this.editor.session.getScreenLength() * this.editor.renderer.lineHeight);
        } else if (this.scroller) {
            // cm6 Scroll Ratio
            const scrollHeight = this.scroller.scrollHeight;
            return scrollHeight > 0 ? this.scroller.scrollTop / scrollHeight : 0;
        }
        return 0;
    }

    updateScrollPosition() {
        if (this.isAce && this.editor.session) {
            this.editor.session.setScrollTop(this.initialScrollRatio * this.editor.session.getScreenLength() * this.editor.renderer.lineHeight);
        } else if (this.scroller) {
            // CM6 Scroll Position
             const scrollHeight = this.scroller.scrollHeight;
             this.scroller.scrollTop = this.initialScrollRatio * scrollHeight;
        }
    }

    startZoom(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            this.closeKeyboard();
            this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            
            this.initialScale = this.getCurrentFontSize(); 
            this.currentScale = this.initialScale;
            
            // Load Limits
            const settings = getSettings();
            this.minFontSize = settings.minZoom || 8;
            this.maxFontSize = settings.maxZoom || 50;

            this.initialScrollRatio = this.getScrollRatio();
            this.showZoomBubble(`${this.currentScale.toFixed(1)}px`);
            
            if(typeof this.highlightCallback === 'function') {
                this.highlightCallback();
            }
        }
    }

    zoom(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
            
            this.currentScale = Math.max(
                this.minFontSize,
                Math.min(this.maxFontSize, this.initialScale * (currentDistance / this.initialDistance))
            );

            this.setFontSize(this.currentScale);
            this.updateScrollPosition();
            this.updateZoomBubble(`${this.currentScale.toFixed(1)}px`);
        }
    }

    updateZoomBubble(fontSize) {
        if (this.zoomBubble) this.zoomBubble.textContent = fontSize;
    }

    showZoomBubble(fontSize) {
        if (!this.zoomBubble) {
            this.zoomBubble = document.createElement("div");
            this.zoomBubble.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 16px;
                z-index: 100; /* Increased z-index to stay above CM6 elements */
                pointer-events: none; /* Prevents touch interference */
            `;
            document.body.appendChild(this.zoomBubble);
        }
        this.zoomBubble.textContent = fontSize;
        this.zoomBubble.style.display = "block";
    }

    hideZoomBubble() {
        if (this.zoomBubble) {
            this.zoomBubble.style.display = "none";
        }
        
        const settings = getSettings();
        const activeFile = editorManager.activeFile;

        if (!activeFile || this.currentScale === this.initialScale || this.currentScale <= 0) {
            return;
        }

        if (settings.zoomMode === 'savePerFile') {
            zoomMemory.setFileZoom(activeFile.uri, this.currentScale);
        }
    }
    
    destroy() {
         this.destroyListeners();
         if (this.zoomBubble) {
            if(this.zoomBubble.parentNode) this.zoomBubble.parentNode.removeChild(this.zoomBubble);
            this.zoomBubble = null;
        }
    }
}