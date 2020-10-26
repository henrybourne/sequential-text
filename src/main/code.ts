
// This shows the HTML page in "index.html".
figma.showUI(__html__, {width: 300, height: 300 });

let textNodes: TextNode[] = [];
let missingFontNodes: TextNode[] = [];
let fonts: FontName[] = [];
updateTextNodesFromSelection();

figma.on('selectionchange', () => {
	updateTextNodesFromSelection();
});

figma.ui.onmessage = async (msg) => {

	if (msg.type === 'update-text') {

		// Load fonts
		await Promise.all(fonts.map((font) => {
			return figma.loadFontAsync(font);
		}));

		// Sort text nodes to apply orientation
		if (msg.orientation === 'rows') {
			textNodes.sort(function (a,b) {
				if (a.y > b.y) return  1;
				if (a.y < b.y) return -1;
				if (a.x > b.x) return  1;
				if (a.x < b.x) return -1;
				return 0;
			});
		} else {
			textNodes.sort(function (a,b) {
				if (a.x > b.x) return  1;
				if (a.x < b.x) return -1;
				if (a.y > b.y) return  1;
				if (a.y < b.y) return -1;
				return 0;
			});
		}
		
		// Update characters
		for (var i = 0; i < msg.sequence.length; i++) {
			textNodes[i].characters = msg.sequence[i];
		}

		figma.closePlugin();
	}

	if (msg.type === 'selectMissingFontNodes') {
		figma.currentPage.selection = missingFontNodes;
		figma.notify("Selected Text layers with missing fonts");
		figma.closePlugin();
	}

	if (msg.type === 'cancel') {
		figma.closePlugin();
	}

};


function updateTextNodesFromSelection() {
	textNodes = [];
	missingFontNodes = [];
	fonts = [];
	
	for (const node of figma.currentPage.selection) {
		if (node.type === "TEXT") {
			// Store text nodes only
			textNodes.push(node);

			// Identify missing fonts
			if (node.hasMissingFont === true) { missingFontNodes.push(node); }
			
			// Identify unique fonts in selection
			if (node.fontName === figma.mixed) {
				// mixed font in the node
				for (let i = 0; i < node.characters.length; i++) {
					let currentFontName = node.getRangeFontName(i, i + 1) as FontName;
					if (!fonts.some((item) => item.family === currentFontName.family && item.style === currentFontName.style)) {
						fonts.push(currentFontName);
					}
				}
			} else {
				// Single font in the node
				if (!fonts.some((item) => item.family === (node.fontName as FontName).family && item.style === (node.fontName as FontName).style)) {
					fonts.push(node.fontName);
				}
			}
		}
	}
	sendTextNodesToUI();
}

async function loadFonts() {
	const promises = fonts.map((font) => figma.loadFontAsync(font)
		.catch(e => {
			figma.notify(e);
			return false;
		})
	);
	await Promise.all(promises);
}

function sendTextNodesToUI() {
	figma.ui.postMessage({
	  type: 'textNodes',
		textNodes,
		missingFontNodes
	});
}