//vars
const mainBody                      = document.querySelector('#mainBody');
const updateTextButton              = document.querySelector('#updateText');
const cancelButton                  = document.querySelector('#cancel');
const textPatternInput              = document.querySelector('#textPattern');
const preview                       = document.querySelector('#preview');
const missingFontsBody              = document.querySelector('#missingFontsBody');
const selectMissingFontNodesButton  = document.querySelector('#selectMissingFontNodes');

var textSequence = [];
var selectionCount = 0;
var missingFontsCount = 0;


// Focus input field
textPatternInput.focus();

// //on load function
// document.addEventListener("DOMContentLoaded", function() {
//     validation();
// });

window.onmessage = async event => {
    console.log('window.onmessage');
    const message = event.data.pluginMessage
    if (message.type === 'textNodes') {
        selectionCount = message.textNodes.length;
        missingFontsCount = message.missingFontNodes.length;
        validation();
    }
}

//event listeners
textPatternInput.oninput = () => { validation(); }
updateTextButton.onclick = () => { updateText(); }
selectMissingFontNodesButton.onclick = () => { selectMissingFontNodes(); }
cancelButton.onclick = () => { cancel(); }

//form validation
function validation() {
    if (missingFontsCount > 0) {
        // Handle missing fonts
        mainBody.style.display = 'none';
        missingFontsBody.style.display = 'flex';
    }
    else {
        // No missing fonts
        mainBody.style.display = 'block';
        missingFontsBody.style.display = 'none';
        if (selectionCount == 0) {
            // handle no text objects selected
            updateTextButton.disabled = true;
            preview.innerHTML = 'Select at least one text layer';
            preview.classList.add("descriptor");
        }
        else if (textPatternInput.value === '') {
            // Handle no text pattern
            updateTextButton.disabled = true;
            preview.innerHTML = 'Enter a text pattern';
            preview.classList.add("descriptor");
        } else {
            // Everything OK
            updateTextButton.disabled = false;
            self.textSequence = createSequence();
            preview.innerHTML = '';
            preview.classList.remove("descriptor");
            for (const t of self.textSequence) {
                preview.innerHTML += t + "<br />";
            }
        }
    }
}

function parseRange(value) {
    const reg = new RegExp(/(\d*)([^\d:]+)(\d*)$/);
    const rangeMatch = value.match(reg);
    const [a, b] = rangeMatch || [];
    if (a && b) {
      return rangeMatch;
    }
    return;
};
  
function parseNumber(value) {
    const reg2 = new RegExp(/(\d*)$/);
    const numberMatch = value.match(reg2);
    if (numberMatch && numberMatch[0] !== "") {
      return numberMatch[0];
    }
    return;
};
  
function createSequence() {
    newText = [];
  
    // handle case where user has entered a range
    const range = parseRange(textPatternInput.value);
    if (range) {
        const [originalRangeStr, from, delim, to] = range;
        const prefix = ""
        const diff = to - from;
        // Loop through each element and create label
        var elementNumber = 0;
        for (var i = 0; i < selectionCount; i++) {
            var newFrom = (parseInt(from) + (diff + 1) * i).toString();
            var fromLengthDifference = from.length - newFrom.length;
            if (fromLengthDifference > 0) {
                newFrom = '0'.repeat(fromLengthDifference) + newFrom;
            }
            var newTo = (parseInt(to) + (diff + 1) * i).toString();
            var toLengthDifference = to.length - newTo.length;
            if (toLengthDifference > 0) {
                newTo = '0'.repeat(toLengthDifference) + newTo;
            }
            newText[i] = textPatternInput.value.replace(
                originalRangeStr,
                `${newFrom}${delim}${newTo}`
            );
        }
        return newText;
    }
  
    // handle case where user input just ends in a single number
    var number = parseNumber(textPatternInput.value); 
    if (number) {
        // Loop through each element and create label
        var elementNumber = 0;
        for (var i = 0; i < selectionCount; i++) {
            var newNumber = (parseInt(number) + i).toString();
            var numberLengthDifference = number.length - newNumber.length;
            if (numberLengthDifference > 0) {
                newNumber = '0'.repeat(numberLengthDifference) + newNumber;
            }
            console.log(newNumber);
            newText[i] = textPatternInput.value.replace(
                number,
                newNumber
            );
        }
        return newText;
    }
  
    // handle case where user input does not have a suffix
    // Loop through each element and create label
    for (var i = 0; i < selectionCount; i++) {
        var newNumber = parseInt(number) + i;
        newText[i] = textPatternInput.value;
    }
    return newText;
}

function updateText() {
    parent.postMessage({ pluginMessage: { 
        'type': 'update-text', 
        'sequence': textSequence
    } }, '*');
}

function selectMissingFontNodes() {
    parent.postMessage({ pluginMessage: { 'type': 'selectMissingFontNodes' } }, '*');
}

function cancel() {
    parent.postMessage({ pluginMessage: { 'type': 'cancel' } }, '*');
}