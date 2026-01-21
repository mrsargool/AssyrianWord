
// --- STATE MANAGEMENT ---
let docs = JSON.parse(localStorage.getItem('assyrianDocs')) || [];
let currentDocId = null;
let isPhysicalKeyboardEnabled = false;

// Constants for A4 math
const A4_HEIGHT_PX = 1123;
const PAGE_GAP_PX = 10;

// Undo/Redo History
let history = [];
let historyIndex = -1;
let isUndoRedoing = false;

// --- INIT ---
window.onload = function () {
    renderDashboard();

    // Context Menu Listeners
    document.addEventListener('mousedown', hideContextMenu);
    document.getElementById('paper').addEventListener('contextmenu', handleContextMenu);
};

function updateCounter() {
    const text = document.getElementById('paper').innerText.trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).length : 0;

    const counter = document.getElementById('counter');
    if (counter) {
        counter.innerText = `${words} Words ${chars} Characters`;
    }
}

// --- DASHBOARD FUNCTIONS ---
function renderDashboard() {
    const grid = document.getElementById('doc-grid');
    // Remove existing doc cards (keep the first "New Doc" card)
    const newDocBtn = grid.firstElementChild;
    grid.innerHTML = '';
    grid.appendChild(newDocBtn);

    docs.sort((a, b) => b.lastModified - a.lastModified);

    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card';
        card.onclick = (e) => {
            if (!e.target.closest('.delete-btn')) openDoc(doc.id);
        };

        const dateStr = new Date(doc.lastModified).toLocaleDateString();
        const previewText = doc.content.replace(/<[^>]*>?/gm, '').substring(0, 100) || "Empty document";

        card.innerHTML = `
                    <div class="doc-preview">${previewText}</div>
                    <div class="doc-info">
                        <div class="doc-title">${doc.title}</div>
                        <div class="doc-date">Opened ${dateStr}</div>
                        <div class="delete-btn" onclick="deleteDoc(event, ${doc.id})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </div>
                    </div>
                `;
        grid.appendChild(card);
    });
}

function createNewDoc() {
    const newDoc = {
        id: Date.now(),
        title: "Untitled Document",
        content: "",
        lastModified: Date.now()
    };
    docs.push(newDoc);
    saveToStorage();
    openDoc(newDoc.id);
}

function openDoc(id) {
    currentDocId = id;
    const doc = docs.find(d => d.id === id);

    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('editor-view').style.display = 'flex';

    document.getElementById('doc-title').value = doc.title;
    document.getElementById('paper').innerHTML = doc.content;

    updatePageHeight();
    updateCounter();

    document.title = doc.title + " - AssyrianWord";
    document.getElementById('paper').focus();
}

function showDashboard() {
    document.title = "AssyrianWord";
    document.getElementById('editor-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
    currentDocId = null;
    renderDashboard();
}

function deleteDoc(e, id) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
        docs = docs.filter(d => d.id !== id);
        saveToStorage();
        renderDashboard();
    }
}

// --- EDITOR LOGIC ---

function handleInput() {
    autoSave();
    updatePageHeight();
    updateCounter();
}

function autoSave() {
    document.getElementById('save-status').innerText = "Saving...";

    const content = document.getElementById('paper').innerHTML;
    const title = document.getElementById('doc-title').value;
    document.title = title + " - AssyrianWord";

    const docIndex = docs.findIndex(d => d.id === currentDocId);
    if (docIndex > -1) {
        docs[docIndex].content = content;
        docs[docIndex].title = title;
        docs[docIndex].lastModified = Date.now();
        saveToStorage();

        setTimeout(() => {
            document.getElementById('save-status').innerText = "Saved";
        }, 500);
    }
}

function updateTitle() {
    autoSave();
}

function saveToStorage() {
    localStorage.setItem('assyrianDocs', JSON.stringify(docs));
}

/* PAGINATION SYSTEM 
   This calculates if the text has exceeded A4 height. 
   If it has, it increases the background height of the wrapper
   to the next multiple of A4, creating a visual "Page Break"
   using the CSS gradient.
*/
function updatePageHeight() {
    const paper = document.getElementById('paper');
    const wrapper = document.getElementById('page-wrapper');

    // 1. Get the computed style to find the actual padding values
    const style = window.getComputedStyle(paper);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);

    // 2. Calculate the "inner" height (actual text height)
    // scrollHeight includes padding, so we subtract it to get the raw content height
    // Note: This is an approximation. scrollHeight behavior varies slightly by browser.
    let totalHeight = paper.scrollHeight;

    // 3. Define the usable height of a single A4 page
    // A4_HEIGHT_PX (1123) - Padding (Top + Bottom)
    // If your padding is 25mm (~94px) each, usable height is roughly 1123 - 188 = 935px
    const usablePageHeight = A4_HEIGHT_PX - (paddingTop + paddingBottom) + 200;

    // 4. Calculate pages based on USABLE space, not total height
    // We remove the top/bottom padding from the total height before dividing
    const contentOnlyHeight = totalHeight - (paddingTop + paddingBottom);

    // Ensure at least 1 page
    const pagesNeeded = Math.ceil(Math.max(contentOnlyHeight, 1) / usablePageHeight) || 1;

    // 5. Calculate the new wrapper height
    // (Pages * 1123) + (Gaps)
    const newHeight = (pagesNeeded * A4_HEIGHT_PX) + ((pagesNeeded - 1) * PAGE_GAP_PX);

    wrapper.style.minHeight = newHeight + "px";
}

// --- KEYBOARD LOGIC ---

function addCharacter(char) {
    const paper = document.getElementById('paper');
    paper.focus();

    if (char === '\n') {
        document.execCommand('insertHTML', false, '<br><br>');
    } else {
        document.execCommand('insertText', false, char);
    }
    handleInput();
}

function removeCharacter() {
    document.getElementById('paper').focus();
    document.execCommand('delete');
    handleInput();
}

function clearCharacters() {
    if (confirm('Clear entire document?')) {
        document.getElementById('paper').innerHTML = '';
        handleInput();
    }
}

// Toggles the On-Screen Keyboard
function toggleOSK() {
    const wrapper = document.getElementById('keyboard-wrapper');
    const btn = document.getElementById('osk-toggle');

    if (wrapper.classList.contains('hidden')) {
        wrapper.classList.remove('hidden');
        btn.classList.add('active');
    } else {
        wrapper.classList.add('hidden');
        btn.classList.remove('active');
    }
}

// Toggles the Physical Keyboard Mapping
function togglePhysicalKeyboard() {
    isPhysicalKeyboardEnabled = !isPhysicalKeyboardEnabled;
    const btn = document.getElementById('typing-toggle');

    if (isPhysicalKeyboardEnabled) {
        btn.classList.add('active');
        document.addEventListener('keydown', handlePhysicalTyping);
    } else {
        btn.classList.remove('active');
        document.removeEventListener('keydown', handlePhysicalTyping);
    }
}

document.addEventListener('keydown', function (e) {
    if (e.shiftKey && e.key == ' ') {
        e.preventDefault();
        togglePhysicalKeyboard();
    }
});

function handlePhysicalTyping(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // Allow shortcuts (Ctrl+C, etc)
    if (document.activeElement !== document.getElementById('paper')) return; // Don't steal focus if not editing paper

    // Simple mapping example - Expand this map as needed
    // Currently just logs the key to console
    //console.log("Key pressed: " + e.key);
    //console.log(e.shiftKey);

    const regMap = {
        'a': 'ܐ', 'b': 'ܒ', 'g': 'ܓ', 'd': 'ܕ',
        'h': 'ܗ', 'w': 'ܘ', 'z': 'ܙ', 'k': 'ܟ',
        'm': 'ܡ', 'n': 'ܢ', 'p': 'ܦ', 't': 'ܬ',
        'q': 'ܩ', 'r': 'ܪ', 'f': 'ܫ', 'x': 'ܚ',
        's': 'ܣ', 'j': 'ܓ̰', 'c': 'ܨ', 'u': 'ܘܼ', 'o': 'ܘܿ',
        'e': 'ܥ', 'y': 'ܝ', 'l': 'ܠ', 'i': 'ܝܼ', 'v': 'ܛ',

        ',': '،',   // comma → Arabic comma
        '.': '.',   // dot → dot
        '!': '!',    // exclamation → exclamation

        '`': '̰', '2': 'ܵ', '1': 'ܲ', '3': 'ܸ', '4': 'ܹ', '5': 'ܿ', '6': 'ܼ', '7': '̇', '8': '̣', '9': '̈', '0': '̤',
        '\\': '݇'
    };

    const shiftMap = {
        '~': '̮',
        'g': 'ܓ̣',     // Shift + g
        'b': 'ܒ̣',     // Shift + b
        'p': 'ܦ̮',     // Shift + p
        'o': 'ܘܼ',     // Shift + o
        '?': '؟'
    };

    if (regMap[e.key.toLowerCase()] && !e.shiftKey) {
        e.preventDefault();
        addCharacter(regMap[e.key.toLowerCase()]);
    } else if (shiftMap[e.key.toLowerCase()]) {
        e.preventDefault();
        addCharacter(shiftMap[e.key.toLowerCase()]);
    }
}


// --- CONTEXT MENU AND TRANSLITERATION ---

function handleContextMenu(e) {
    e.preventDefault();

    const selection = window.getSelection().toString().trim();
    if (!selection) return;

    const menu = document.getElementById('custom-context-menu');
    const translitOption = document.getElementById('transliterate-option');

    // Assyrian Unicode Block Range approx: U+0700–U+074F
    // We check if the selection contains characters in this range
    const isAssyrian = /[\u0700-\u077F]/.test(selection);

    if (isAssyrian) {
        translitOption.style.display = 'block';
    } else {
        translitOption.style.display = 'none';
    }

    // Position menu
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.style.display = 'block';
}

function hideContextMenu() {
    document.getElementById('custom-context-menu').style.display = 'none';
}

function deleteSelection() {
    document.execCommand('delete');
    handleInput();
}

function transliterateSelection() {
    const selection = window.getSelection().toString();
    if (selection) {
        const result = aiiTranslit(selection);
        
        document.getElementById('translit-phonetic').innerText = result.phonetic;
        
        document.getElementById('translit-modal').style.display = 'flex';
    }
}

function defineSelection(){
    const selection = window.getSelection().toString();
    window.open('https://www.sharrukin.io/assyrian-dictionary/?search=' + encodeURIComponent(selection), '_blank');
}

function closeModal(e) {
    // If e is present, it's a click event. Only close if clicking overlay or button.
    if(e && e.target.id !== 'translit-modal' && !e.target.classList.contains('modal-close-btn')) return;
    
    document.getElementById('translit-modal').style.display = 'none';
}