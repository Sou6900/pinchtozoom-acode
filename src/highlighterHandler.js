// src/highlighterHandler.js
import { getSettings } from './settings.js';

const STYLE_ID = "pinch-to-zoom-highlight-style"; 

export class HighlighterHandler {
    constructor(editor) {
        this.editor = editor;
        // Safety check
        if (this.editor.getSession) {
            this.session = editor.getSession();
            this.isAce = true;
            this.isActive = true;
        } else {
            this.session = null;
            this.isAce = false;
            this.isActive = false; // Disable highlighting for CM6
        }
        
        this.pinnedRows = [];
        
        if (this.isActive) {
            this.injectHighlightStyles();
        }
    }

    pinCurrentRow() {
        if (!this.isActive) return;

        const settings = getSettings();
        const maxRows = settings.maxHighlightRows;
        
        if (maxRows <= 0) {
             if (this.pinnedRows.length > 0) {
                this.pinnedRows = [];
                this.clearAllHighlights();
             }
             return;
        }

        const currentRow = this.editor.getCursorPosition().row;
        const existingIndex = this.pinnedRows.indexOf(currentRow);
        if (existingIndex > -1) {
             this.pinnedRows.splice(existingIndex, 1);
        }

        this.pinnedRows.unshift(currentRow);

        if (this.pinnedRows.length > maxRows) {
            this.pinnedRows = this.pinnedRows.slice(0, maxRows);
        }

        this.updateRowHighlightStyles();
    }

    updateRowHighlightStyles() {
        if (!this.isActive) return;

        const settings = getSettings();
        const maxRows = settings.maxHighlightRows;
        
        this.clearAllHighlights();
        
        this.pinnedRows.forEach((row, index) => {
            if (index < maxRows) {
                this.session.addGutterDecoration(row, `highlighted-row-${index + 1}`);
            }
        });
        
        if (this.pinnedRows.length > maxRows) {
            this.pinnedRows = this.pinnedRows.slice(0, maxRows);
        }
    }

    clearAllHighlights() {
        if (!this.isActive) return;

        this.pinnedRows.forEach((row, index) => {
             for(let i=1; i<=4; i++) {
                 this.session.removeGutterDecoration(row, `highlighted-row-${i}`);
             }
        });
        
        // Fallback cleanup
        const allRows = this.session.getDocument().getLength();
        for (let row = 0; row < allRows; row++) {
            for(let i=1; i<=4; i++) {
                 this.session.removeGutterDecoration(row, `highlighted-row-${i}`);
            }
        }
    }

    injectHighlightStyles() {
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement("style");
            style.id = STYLE_ID;
            style.innerHTML = `
                .ace_gutter-cell.highlighted-row-1 {
                    background-color: rgb(250,31,31) !important;
                }
                .ace_gutter-cell.highlighted-row-2 {
                    background-color: rgb(0,49,139) !important;
                }
                .ace_gutter-cell.highlighted-row-3 {
                    background-color: rgb(3,72,216) !important;
                }
                .ace_gutter-cell.highlighted-row-4 {
                    background-color: rgb(100,153,252) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    destroy() {
        if (this.isActive) {
            this.clearAllHighlights();
        }
        const styleElement = document.getElementById(STYLE_ID);
         if (styleElement) {
            styleElement.remove();
        }
        this.pinnedRows = [];
    }
}