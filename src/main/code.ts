
// This shows the HTML page in "index.html".
figma.showUI(__html__, {width: 300, height: 300 });

var textNodes: TextNode[] = [];
var missingFontNodes: TextNode[] = [];
var fonts: FontName[] = [];
updateTextNodesFromSelection();

figma.on('selectionchange', () => {
	updateTextNodesFromSelection();
});

figma.ui.onmessage = async (msg) => {

	if (msg.type === 'update-text') {

		// Sort text nodes
		textNodes.sort(function (a,b) {
			if (a.y > b.y) return  1;
			if (a.y < b.y) return -1;
			if (a.x > b.x) return  1;
			if (a.x < b.x) return -1;
			return 0;
		});

		// Load fonts
		

		// Update characters
		for (var i = 0; i < msg.sequence.length; i++) {
			console.log('Update node: ' + textNodes[i].characters);
			textNodes[i].characters = msg.sequence[i];
		}
		figma.closePlugin();
	}

	if (msg.type === 'selectMissingFontNodes') {
		figma.currentPage.selection = missingFontNodes;
		figma.notify("Selected Text layers with missing fonts");
		figma.closePlugin();
	}

};


function updateTextNodesFromSelection() {
	textNodes = [];
	missingFontNodes = [];
	fonts = [];
	// for (const node of figma.currentPage.selection) {
	// 	if (node.type === "TEXT") {
	// 		textNodes.push(node);
	// 		if (node.hasMissingFont === true) { missingFontNodes.push(node); }
	// 		if (typeof node.fontName != 'symbol') {
	// 			if (!fonts.some((item) => item.family === (node.fontName as FontName).family && item.style === (node.fontName as FontName).style)) {
	// 				fonts.push(node.fontName);
	// 			}
	// 		}
	// 	}
	// }


	for (var iNode=0; iNode < figma.currentPage.selection.length; iNode++) {
		const node = figma.currentPage.selection[iNode];
		if (node.type === "TEXT") {
			textNodes.push(node);
			if (node.hasMissingFont === true) { missingFontNodes.push(node); }
			if (typeof node.fontName != 'symbol') {
				if (!fonts.some((item) => item.family === (node.fontName as FontName).family && item.style === (node.fontName as FontName).style)) {
					fonts.push(node.fontName);
				}
			}
		}
	}

	loadFonts();
	sendTextNodesToUI();
}

async function loadFonts() {
	const promises = fonts.map((font) => figma.loadFontAsync(font));
	// await Promise.all(promises);
}

function sendTextNodesToUI() {
	figma.ui.postMessage({
	  type: 'textNodes',
		textNodes,
		missingFontNodes
	});
}