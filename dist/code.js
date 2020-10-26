var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This shows the HTML page in "index.html".
figma.showUI(__html__, { width: 300, height: 300 });
let textNodes = [];
let missingFontNodes = [];
let fonts = [];
updateTextNodesFromSelection();
figma.on('selectionchange', () => {
    updateTextNodesFromSelection();
});
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'update-text') {
        // Load fonts
        let results = yield Promise.all(fonts.map((font) => {
            return figma.loadFontAsync(font);
        }));
        // Sort text nodes
        textNodes.sort(function (a, b) {
            if (a.y > b.y)
                return 1;
            if (a.y < b.y)
                return -1;
            if (a.x > b.x)
                return 1;
            if (a.x < b.x)
                return -1;
            return 0;
        });
        console.log("Sorted Text Nodes");
        // Update characters
        for (var i = 0; i < msg.sequence.length; i++) {
            textNodes[i].characters = msg.sequence[i];
        }
        console.log("Updated Characters");
        figma.closePlugin();
    }
    if (msg.type === 'selectMissingFontNodes') {
        figma.currentPage.selection = missingFontNodes;
        figma.notify("Selected Text layers with missing fonts");
        figma.closePlugin();
    }
});
function updateTextNodesFromSelection() {
    textNodes = [];
    missingFontNodes = [];
    fonts = [];
    for (const node of figma.currentPage.selection) {
        if (node.type === "TEXT") {
            // Store text nodes only
            textNodes.push(node);
            // Identify missing fonts
            if (node.hasMissingFont === true) {
                missingFontNodes.push(node);
            }
            // Identify unique fonts in selection
            if (node.fontName === figma.mixed) {
                // mixed font in the node
                for (let i = 0; i < node.characters.length; i++) {
                    let currentFontName = node.getRangeFontName(i, i + 1);
                    if (!fonts.some((item) => item.family === currentFontName.family && item.style === currentFontName.style)) {
                        fonts.push(currentFontName);
                    }
                }
            }
            else {
                // Single font in the node
                if (!fonts.some((item) => item.family === node.fontName.family && item.style === node.fontName.style)) {
                    fonts.push(node.fontName);
                }
            }
        }
    }
    sendTextNodesToUI();
}
function loadFonts() {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = fonts.map((font) => figma.loadFontAsync(font)
            .catch(e => {
            figma.notify(e);
            return false;
        }));
        yield Promise.all(promises);
    });
}
function sendTextNodesToUI() {
    figma.ui.postMessage({
        type: 'textNodes',
        textNodes,
        missingFontNodes
    });
}
