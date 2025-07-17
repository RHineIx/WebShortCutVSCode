document.addEventListener('DOMContentLoaded', () => {
    // 1. DATA (Default shortcuts)
    const translations = {
        en: {
            pageTitle: "VS Code Shortcuts", mainHeader: "Essential VS Code Shortcuts", sizeLabel: "Size:", spacingLabel: "Spacing:", compact: "Compact", default: "Default", spacious: "Spacious", viewLabel: "View:", fontLabel: "Font:", langBtn: "عربي",
            shortcuts: [
                { keys: "Ctrl+Shift+P", action: "Show Command Palette" }, { keys: "Ctrl+\\", action: "Split Editor" }, { keys: "Ctrl+`", action: "Show Integrated Terminal" },
                { keys: "Alt+↑/↓", action: "Move line up/down" }, { keys: "Shift+Alt+↑/↓", action: "Copy line up/down" }, { keys: "Ctrl+Shift+K", action: "Delete line" },
                { keys: "Ctrl+/", action: "Toggle line comment" }, { keys: "Alt+Z", action: "Toggle word wrap" }, { keys: "Shift+Alt+F", action: "Format document" },
                { keys: "Ctrl+D", action: "Add selection to next match" }, { keys: "Ctrl+L", action: "Select current line" }, { keys: "Ctrl+F2", action: "Select all occurrences of word" }, { keys: "Alt+Click", action: "Insert multiple cursors" }, { keys: "Ctrl+Alt+↑/↓", action: "Insert cursor above/below" }, { keys: "Shift+Alt+Drag", action: "Column (box) selection" },
            ]
        },
        ar: {
            pageTitle: "اختصارات VS Code", mainHeader: "اختصارات VS Code الأساسية", sizeLabel: "الحجم:", spacingLabel: "التباعد:", compact: "مدمج", default: "افتراضي", spacious: "واسع", viewLabel: "العرض:", fontLabel: "الخط:", langBtn: "English",
            shortcuts: [
                { keys: "Ctrl+Shift+P", action: "إظهار لوحة الأوامر" }, { keys: "Ctrl+\\", action: "تقسيم المحرر" }, { keys: "Ctrl+`", action: "إظهار الطرفية المدمجة" },
                { keys: "Alt+↑/↓", action: "نقل السطر لأعلى/لأسفل" }, { keys: "Shift+Alt+↑/↓", action: "نسخ السطر لأعلى/لأسفل" }, { keys: "Ctrl+Shift+K", action: "حذف السطر" },
                { keys: "Ctrl+/", action: "تفعيل/إلغاء تعليق السطر" }, { keys: "Alt+Z", action: "تفعيل/إلغاء التفاف النص" }, { keys: "Shift+Alt+F", action: "تنسيق المستند" },
                { keys: "Ctrl+D", action: "إضافة التحديد للمطابقة التالية" }, { keys: "Ctrl+L", action: "تحديد السطر الحالي" }, { keys: "Ctrl+F2", action: "تحديد كل ظهور للكلمة الحالية" }, { keys: "Alt+Click", action: "إدراج مؤشرات متعددة" }, { keys: "Ctrl+Alt+↑/↓", action: "إدراج مؤشر للأعلى/للأسفل" }, { keys: "Shift+Alt+Drag", action: "التحديد العمودي (Box)" },
            ]
        }
    };
    
    // 2. STATE & CONSTANTS
    const PIXELS_PER_MM = 3.78;
    const SNAP_TOLERANCE = 10;
    let customShortcuts = [];
    let stickerZoneState = { x: 50, y: 50, width: 100 * PIXELS_PER_MM, height: 100 * PIXELS_PER_MM, shortcuts: [], scale: 1, contentWidth: null, contentHeight: null };
    let activeAction = { type: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startZoneX: 0, startZoneY: 0, initialScale: 1, isScaling: false };

    // 3. ELEMENT SELECTORS
    const elements = {
        cheatSheet: document.getElementById('cheatsheet'),
        mainGrid: document.getElementById('main-grid'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        langToggleBtn: document.getElementById('lang-toggle'),
        fontSwitcher: document.getElementById('font-switcher'),
        keysFontSwitcher: document.getElementById('keys-font-switcher'),
        sizeSlider: document.getElementById('size-slider'),
        sliderValueDisplay: document.getElementById('slider-value'),
        sizeControls: { s: document.getElementById('size-s'), m: document.getElementById('size-m'), l: document.getElementById('size-l') },
        spacingControls: { compact: document.getElementById('spacing-compact'), default: document.getElementById('spacing-default'), spacious: document.getElementById('spacing-spacious') },
        viewControls: { grid: document.getElementById('view-grid'), list: document.getElementById('view-list') },
        addShortcutBtn: document.getElementById('add-shortcut-btn'),
        modal: document.getElementById('shortcut-modal'),
        modalForm: document.getElementById('shortcut-form'),
        modalTitle: document.getElementById('modal-title'),
        cancelBtn: document.getElementById('cancel-shortcut-btn'),
        shortcutIdInput: document.getElementById('shortcut-id'),
        keysInput: document.getElementById('shortcut-keys'),
        actionEnInput: document.getElementById('shortcut-action-en'),
        actionArInput: document.getElementById('shortcut-action-ar'),
        openPrintEditorBtn: document.getElementById('open-print-editor-btn'),
        printEditor: document.getElementById('print-editor'),
        closePrintEditorBtn: document.getElementById('close-print-editor-btn'),
        libraryItemsContainer: document.getElementById('library-items'),
        canvas: document.getElementById('a4-canvas'),
        printLayoutBtn: document.getElementById('print-layout-btn'),
        stickerZone: document.getElementById('sticker-zone'),
        stickerZoneContent: document.getElementById('sticker-zone-content'),
        stickerZoneDims: document.getElementById('sticker-zone-dims'),
        clearStickerZoneBtn: document.getElementById('clear-sticker-zone-btn'),
        syncSettingsBtn: document.getElementById('sync-settings-btn'),
        syncModal: document.getElementById('sync-modal'),
        syncForm: document.getElementById('sync-form'),
        gistIdInput: document.getElementById('gist-id-input'),
        githubTokenInput: document.getElementById('github-token-input'),
        cancelSyncBtn: document.getElementById('cancel-sync-btn'),
    };
    
    // 4. FUNCTIONS
    const addListener = (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        }
    };

    const createShortcutCard = (item, context = 'main') => {
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        const keysContainer = document.createElement('div');
        keysContainer.className = 'keys';
        item.keys.split('+').forEach((keyText, index, arr) => {
            const kbd = document.createElement('kbd');
            kbd.textContent = keyText.trim();
            keysContainer.appendChild(kbd);
            if (index < arr.length - 1) {
                const plus = document.createTextNode(' + ');
                keysContainer.appendChild(plus);
            }
        });
        const actionEl = document.createElement('div');
        actionEl.className = 'action';
        actionEl.textContent = item.action;
        card.appendChild(keysContainer);
        card.appendChild(actionEl);
        if (item.isCustom && context === 'main') {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'card-actions';
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.title = 'Edit';
            editBtn.dataset.id = item.id;
            editBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = 'Delete';
            deleteBtn.dataset.id = item.id;
            deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
            actionsContainer.appendChild(editBtn);
            actionsContainer.appendChild(deleteBtn);
            card.appendChild(actionsContainer);
        }
        if (context === 'stickerZone') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'sticker-zone-card-delete';
            deleteBtn.title = 'Remove from sticker';
            deleteBtn.dataset.instanceId = item.instanceId; 
            deleteBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
            card.appendChild(deleteBtn);
        }
        return card;
    };

    const renderShortcuts = () => {
        const lang = localStorage.getItem('cheatSheetLang') || 'en';
        const grid = elements.mainGrid;
        if (!grid) return;
        const defaultShortcuts = translations[lang].shortcuts.map(s => ({ ...s, isCustom: false }));
        const translatedCustomShortcuts = customShortcuts.map(item => ({
            id: item.id,
            keys: item.keys,
            action: lang === 'ar' ? item.actionAR : item.actionEN,
            isCustom: true
        }));
        const data = [...defaultShortcuts, ...translatedCustomShortcuts];
        grid.innerHTML = '';
        data.forEach(item => {
            grid.appendChild(createShortcutCard(item, 'main'));
        });
    };

    const updateSize = (width) => {
        if (!elements.cheatSheet) return;
        elements.cheatSheet.style.width = `${width}mm`;
        elements.sizeSlider.value = width;
        elements.sliderValueDisplay.textContent = `${width}mm`;
        const sizeMapping = { s: '90', m: '180', l: '240' };
        Object.values(elements.sizeControls).forEach(btn => btn.classList.remove('active'));
        for (const [key, value] of Object.entries(sizeMapping)) {
            if (String(width) === value) {
                if (elements.sizeControls[key]) {
                    elements.sizeControls[key].classList.add('active');
                }
                break;
            }
        }
        localStorage.setItem('cheatSheetSize', width);
    };
    const setSpacing = (spacingName) => {
        if (!elements.cheatSheet) return;
        elements.cheatSheet.classList.remove('spacing-compact', 'spacing-spacious');
        if (spacingName !== 'default') elements.cheatSheet.classList.add(`spacing-${spacingName}`);
        Object.keys(elements.spacingControls).forEach(key => {
            if(elements.spacingControls[key]) elements.spacingControls[key].classList.toggle('active', key === spacingName)
        });
        localStorage.setItem('cheatSheetSpacing', spacingName);
    };
    const setTheme = (themeName) => {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeName}`);
        if(elements.themeToggleBtn) {
            const iconName = themeName === 'dark' ? 'dark_mode' : 'light_mode';
            elements.themeToggleBtn.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
        }
        localStorage.setItem('cheatSheetTheme', themeName);
    };
    const setView = (viewName) => {
        if (!elements.cheatSheet) return;
        elements.cheatSheet.classList.remove('view-grid', 'view-list');
        elements.cheatSheet.classList.add(`view-${viewName}`);
        Object.keys(elements.viewControls).forEach(key => {
            if(elements.viewControls[key]) elements.viewControls[key].classList.toggle('active', key === viewName)
        });
        localStorage.setItem('cheatSheetView', viewName);
        renderShortcuts();
    };
    const setFont = (fontName) => {
        document.body.classList.remove('font-cairo', 'font-tajawal', 'font-amiri');
        document.body.classList.add(`font-${fontName}`);
        if(elements.fontSwitcher) elements.fontSwitcher.value = fontName;
        localStorage.setItem('cheatSheetFont', fontName);
    };
    const setKeysFont = (fontName) => {
        document.body.classList.remove('keys-font-robotomono', 'keys-font-firacode', 'keys-font-inter');
        if (fontName !== 'default') {
            document.body.classList.add(`keys-font-${fontName}`);
        }
        if(elements.keysFontSwitcher) elements.keysFontSwitcher.value = fontName;
        localStorage.setItem('cheatSheetKeysFont', fontName);
    };
    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        const langData = translations[lang];
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (langData[key]) el.textContent = langData[key];
        });
        document.title = langData.pageTitle;
        if(elements.langToggleBtn) elements.langToggleBtn.textContent = langData.langBtn;
        localStorage.setItem('cheatSheetLang', lang);
        renderShortcuts();
    };

    async function loadCustomShortcuts() {
        const gistId = localStorage.getItem('gistId');
        const githubToken = localStorage.getItem('githubToken');
        if (!gistId || !githubToken) {
            customShortcuts = JSON.parse(localStorage.getItem('customShortcuts_v2')) || [];
            return;
        }
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`, { headers: { 'Authorization': `token ${githubToken}` } });
            if (!response.ok) throw new Error(`Gist fetch failed: ${response.status}`);
            const data = await response.json();
            const content = data.files['shortcuts.json']?.content;
            let parsedContent = JSON.parse(content || '[]');
            if (Array.isArray(parsedContent)) {
                customShortcuts = parsedContent;
            } else {
                customShortcuts = [];
            }
        } catch (error) {
            console.error("Failed to load from Gist:", error);
            alert("Error: Could not load shortcuts from GitHub Gist. Check sync settings or token permissions.");
            customShortcuts = [];
        }
    }
    async function saveCustomShortcuts(shortcutsData) {
        localStorage.setItem('customShortcuts_v2', JSON.stringify(shortcutsData));
        const gistId = localStorage.getItem('gistId');
        const githubToken = localStorage.getItem('githubToken');
        if (!gistId || !githubToken) return;
        try {
            await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `token ${githubToken}` },
                body: JSON.stringify({ files: { 'shortcuts.json': { content: JSON.stringify(shortcutsData, null, 2) } } })
            });
        } catch (error) {
            console.error("Failed to save to Gist:", error);
            alert("Error: Could not save shortcuts to GitHub Gist.");
        }
    }
    const openModalForEdit = (id) => {
        const shortcutToEdit = customShortcuts.find(s => s.id == id);
        if (!shortcutToEdit) return;
        elements.modalTitle.textContent = "Edit Shortcut";
        elements.shortcutIdInput.value = shortcutToEdit.id;
        elements.keysInput.value = shortcutToEdit.keys;
        elements.actionEnInput.value = shortcutToEdit.actionEN;
        elements.actionArInput.value = shortcutToEdit.actionAR;
        elements.modal.showModal();
    };
    const deleteShortcut = async (id) => {
        if (!confirm("Are you sure you want to delete this shortcut?")) return;
        customShortcuts = customShortcuts.filter(s => s.id != id);
        await saveCustomShortcuts(customShortcuts);
        renderShortcuts();
    };
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const id = elements.shortcutIdInput.value;
        const keys = elements.keysInput.value;
        const actionEN = elements.actionEnInput.value;
        const actionAR = elements.actionArInput.value;
        if (!keys || !actionEN || !actionAR) { return alert("Please fill all fields."); }
        if (id) {
            const index = customShortcuts.findIndex(s => s.id == id);
            if (index > -1) customShortcuts[index] = { id: Number(id), keys, actionEN, actionAR };
        } else {
            const newShortcut = { id: Date.now(), keys, actionEN, actionAR };
            customShortcuts.push(newShortcut);
        }
        await saveCustomShortcuts(customShortcuts);
        elements.modal.close();
        renderShortcuts();
    };
    
    // --- PRINT EDITOR LOGIC ---
    const renderStickerZone = () => {
        if (!elements.stickerZone || !elements.stickerZoneDims || !elements.stickerZoneContent) return;
        const { x, y, width, height, shortcuts, scale, contentWidth, contentHeight } = stickerZoneState;
        elements.stickerZone.style.left = `${x}px`;
        elements.stickerZone.style.top = `${y}px`;
        elements.stickerZone.style.width = `${width}px`;
        elements.stickerZone.style.height = `${height}px`;
        elements.stickerZoneContent.style.transform = `scale(${scale})`;
        if(contentWidth) {
            elements.stickerZoneContent.style.width = `${contentWidth}px`;
            elements.stickerZoneContent.style.height = `${contentHeight}px`;
        } else {
            elements.stickerZoneContent.style.width = '100%';
            elements.stickerZoneContent.style.height = '100%';
        }
        const widthCM = (width / PIXELS_PER_MM / 10).toFixed(1);
        const heightCM = (height / PIXELS_PER_MM / 10).toFixed(1);
        elements.stickerZoneDims.textContent = `${widthCM}cm x ${heightCM}cm`;
        elements.stickerZoneContent.innerHTML = '';
        shortcuts.forEach(shortcut => {
            elements.stickerZoneContent.appendChild(createShortcutCard(shortcut, 'stickerZone'));
        });
    };
    const populatePrintLibrary = () => {
        if (!elements.libraryItemsContainer) return;
        elements.libraryItemsContainer.innerHTML = '';
        const lang = localStorage.getItem('cheatSheetLang') || 'en';
        const defaultShortcuts = translations[lang].shortcuts;
        const customShortcutsFromStorage = JSON.parse(localStorage.getItem('customShortcuts_v2')) || [];
        const customShortcutsTranslated = customShortcutsFromStorage.map(item => ({
            keys: item.keys,
            action: lang === 'ar' ? item.actionAR : item.actionEN
        }));
        const allShortcuts = [...defaultShortcuts, ...customShortcutsTranslated];
        allShortcuts.forEach((shortcut) => {
            const item = document.createElement('div');
            item.className = 'library-item';
            item.textContent = shortcut.action;
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(shortcut));
            });
            elements.libraryItemsContainer.appendChild(item);
        });
    };
    const printDesignedLayout = () => {
        const { x, y, width, height, shortcuts, scale, contentWidth, contentHeight } = stickerZoneState;
        let stickersHTML = '';
        shortcuts.forEach(shortcut => {
            stickersHTML += createShortcutCard(shortcut, 'stickerZone').outerHTML;
        });
        const stylesheets = Array.from(document.styleSheets).map(sheet => sheet.href ? `<link rel="stylesheet" href="${sheet.href}">` : '').join('\n');
        const themeClass = document.body.className;
        const printContent = `
            <!DOCTYPE html>
            <html lang="${localStorage.getItem('cheatSheetLang') || 'en'}">
            <head>
                <title>Print Sticker</title>
                ${stylesheets}
                <style>
                    @page { size: A4; margin: 0; }
                    html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; overflow: hidden; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; font-family: var(--font-family); }
                    * { box-sizing: border-box; }
                    body > * { display: none; }
                    #print-area { display: block !important; width: 100%; height: 100%; position: relative; background-color: transparent; }
                    #print-sticker-zone {
                        position: absolute;
                        left: ${(x / PIXELS_PER_MM).toFixed(2)}mm;
                        top: ${(y / PIXELS_PER_MM).toFixed(2)}mm;
                        width: ${(width / PIXELS_PER_MM).toFixed(2)}mm;
                        height: ${(height / PIXELS_PER_MM).toFixed(2)}mm;
                        overflow: hidden;
                        border: 1px dashed #999;
                    }
                    #print-sticker-zone-content {
                        display: flex; flex-wrap: wrap; gap: 5px; padding: 5px;
                        align-content: flex-start;
                        transform: scale(${scale});
                        transform-origin: top left;
                        background-color: var(--card-bg-color);
                        width: ${contentWidth ? contentWidth + 'px' : '100%'};
                        height: ${contentHeight ? contentHeight + 'px' : '100%'};
                    }
                    .card-actions, .sticker-zone-card-delete { display: none !important; }
                </style>
            </head>
            <body class="${themeClass}">
                <div id="print-area">
                    <div id="print-sticker-zone">
                        <div id="print-sticker-zone-content">${stickersHTML}</div>
                    </div>
                </div>
            </body>
            </html>`;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open(); doc.write(printContent); doc.close();
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => { document.body.removeChild(iframe); }, 1000);
        }, 500);
    };

    function setupEventListeners() {
        addListener(elements.sizeSlider, 'input', (e) => updateSize(e.target.value));
        Object.entries({ s: 90, m: 180, l: 240 }).forEach(([key, width]) => addListener(elements.sizeControls[key], 'click', () => updateSize(width)));
        Object.entries(elements.spacingControls).forEach(([name, button]) => addListener(button, 'click', () => setSpacing(name)));
        addListener(elements.themeToggleBtn, 'click', () => setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark'));
        Object.entries(elements.viewControls).forEach(([name, button]) => addListener(button, 'click', () => setView(name)));
        addListener(elements.fontSwitcher, 'change', () => setFont(elements.fontSwitcher.value));
        addListener(elements.keysFontSwitcher, 'change', () => setKeysFont(elements.keysFontSwitcher.value));
        addListener(elements.langToggleBtn, 'click', () => setLanguage(localStorage.getItem('cheatSheetLang') === 'en' ? 'ar' : 'en'));
        addListener(elements.addShortcutBtn, 'click', () => {
            if(elements.modalForm) elements.modalForm.reset();
            if(elements.shortcutIdInput) elements.shortcutIdInput.value = '';
            if(elements.modalTitle) elements.modalTitle.textContent = "Add New Shortcut";
            if(elements.modal) elements.modal.showModal();
        });
        addListener(elements.cancelBtn, 'click', () => elements.modal.close());
        addListener(elements.modalForm, 'submit', handleFormSubmit);
        addListener(elements.mainGrid, 'click', (event) => {
            const editButton = event.target.closest('.edit-btn');
            if (editButton) openModalForEdit(editButton.dataset.id);
            const deleteButton = event.target.closest('.delete-btn');
            if (deleteButton) deleteShortcut(deleteButton.dataset.id);
        });
        addListener(elements.openPrintEditorBtn, 'click', () => {
            populatePrintLibrary();
            renderStickerZone();
            if (elements.printEditor) elements.printEditor.style.display = 'flex';
        });
        addListener(elements.closePrintEditorBtn, 'click', () => {
            if (elements.printEditor) elements.printEditor.style.display = 'none';
        });
        addListener(elements.clearStickerZoneBtn, 'click', () => {
            if (confirm("Are you sure you want to remove all shortcuts from the sticker?")) {
                stickerZoneState.shortcuts = [];
                renderStickerZone();
            }
        });
        addListener(elements.printLayoutBtn, 'click', printDesignedLayout);
        addListener(elements.stickerZone, 'dragover', (e) => e.preventDefault());
        addListener(elements.stickerZone, 'drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const shortcut = JSON.parse(e.dataTransfer.getData('application/json'));
            shortcut.instanceId = Date.now();
            stickerZoneState.shortcuts.push(shortcut);
            renderStickerZone();
        });
        addListener(elements.stickerZoneContent, 'click', (e) => {
            const deleteBtn = e.target.closest('.sticker-zone-card-delete');
            if (deleteBtn) {
                const instanceIdToDelete = deleteBtn.dataset.instanceId;
                stickerZoneState.shortcuts = stickerZoneState.shortcuts.filter(s => s.instanceId != instanceIdToDelete);
                renderStickerZone();
            }
        });
        addListener(elements.canvas, 'mousedown', (e) => {
            if (e.target.closest('#sticker-zone')) {
                document.body.classList.add('is-designing');
                activeAction.startX = e.clientX;
                activeAction.startY = e.clientY;
                if (e.target.classList.contains('resize-handle')) {
                    activeAction.type = 'resize';
                    activeAction.startWidth = stickerZoneState.width;
                    activeAction.startHeight = stickerZoneState.height;
                    activeAction.initialScale = stickerZoneState.scale;
                    if (e.ctrlKey) {
                        activeAction.isScaling = true;
                        stickerZoneState.contentWidth = elements.stickerZoneContent.scrollWidth;
                        stickerZoneState.contentHeight = elements.stickerZoneContent.scrollHeight;
                    }
                } else if (!e.target.closest('.shortcut-card')) {
                    activeAction.type = 'move';
                    activeAction.startZoneX = stickerZoneState.x;
                    activeAction.startZoneY = stickerZoneState.y;
                }
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (!activeAction.type) return;
            e.preventDefault();
            let snapped = false;
            
            if (activeAction.type === 'move') {
                const dx = e.clientX - activeAction.startX;
                const dy = e.clientY - activeAction.startY;
                let newX = activeAction.startZoneX + dx;
                let newY = activeAction.startZoneY + dy;
                const canvasRect = elements.canvas.getBoundingClientRect();
                const zoneWidth = stickerZoneState.width;
                const zoneHeight = stickerZoneState.height;
                const targetsX = [0, canvasRect.width / 2, canvasRect.width];
                const targetsY = [0, canvasRect.height / 2, canvasRect.height];
                if (Math.abs(newX) < SNAP_TOLERANCE) { newX = 0; snapped = true; }
                if (Math.abs(newX + zoneWidth / 2 - targetsX[1]) < SNAP_TOLERANCE) { newX = targetsX[1] - zoneWidth / 2; snapped = true; }
                if (Math.abs(newX + zoneWidth - targetsX[2]) < SNAP_TOLERANCE) { newX = targetsX[2] - zoneWidth; snapped = true; }
                if (Math.abs(newY) < SNAP_TOLERANCE) { newY = 0; snapped = true; }
                if (Math.abs(newY + zoneHeight / 2 - targetsY[1]) < SNAP_TOLERANCE) { newY = targetsY[1] - zoneHeight / 2; snapped = true; }
                if (Math.abs(newY + zoneHeight - targetsY[2]) < SNAP_TOLERANCE) { newY = targetsY[2] - zoneHeight; snapped = true; }
                stickerZoneState.x = newX;
                stickerZoneState.y = newY;
                if(elements.stickerZone) elements.stickerZone.classList.toggle('is-snapping', snapped);
            
            } else if (activeAction.type === 'resize') {
                const dx = e.clientX - activeAction.startX;
                const dy = e.clientY - activeAction.startY;
                let newWidth = Math.max(50, activeAction.startWidth + dx);
                let newHeight = Math.max(50, activeAction.startHeight + dy);
                
                const canvasRect = elements.canvas.getBoundingClientRect();
                const rightEdge = stickerZoneState.x + newWidth;
                const bottomEdge = stickerZoneState.y + newHeight;
                if (Math.abs(rightEdge - canvasRect.width) < SNAP_TOLERANCE) { newWidth = canvasRect.width - stickerZoneState.x; snapped = true; }
                if (Math.abs(bottomEdge - canvasRect.height) < SNAP_TOLERANCE) { newHeight = canvasRect.height - stickerZoneState.y; snapped = true; }
                stickerZoneState.width = newWidth;
                stickerZoneState.height = newHeight;
                if(elements.stickerZone) elements.stickerZone.classList.toggle('is-snapping', snapped);

                if (activeAction.isScaling) {
                    const widthRatio = stickerZoneState.width / activeAction.startWidth;
                    stickerZoneState.scale = activeAction.initialScale * widthRatio;
                } else {
                    stickerZoneState.scale = 1;
                    stickerZoneState.contentWidth = null;
                    stickerZoneState.contentHeight = null;
                }
            }
            renderStickerZone();
        });
        window.addEventListener('mouseup', () => {
            if(elements.stickerZone) elements.stickerZone.classList.remove('is-snapping');
            document.body.classList.remove('is-designing');
            
            if (activeAction.type === 'resize' && !activeAction.isScaling) {
                stickerZoneState.contentWidth = null;
                stickerZoneState.contentHeight = null;
                renderStickerZone();
            }
            
            activeAction.type = null;
            activeAction.isScaling = false;
        });
        addListener(elements.syncSettingsBtn, 'click', () => {
            elements.gistIdInput.value = localStorage.getItem('gistId') || '';
            elements.githubTokenInput.value = localStorage.getItem('githubToken') || '';
            elements.syncModal.showModal();
        });
        addListener(elements.cancelSyncBtn, 'click', () => {
            elements.syncModal.close();
        });
        addListener(elements.syncForm, 'submit', async (e) => {
            e.preventDefault();
            localStorage.setItem('gistId', elements.gistIdInput.value);
            localStorage.setItem('githubToken', elements.githubTokenInput.value);
            elements.syncModal.close();
            alert('Sync settings saved! Reloading shortcuts...');
            await loadCustomShortcuts();
            renderShortcuts();
        });
    }

    async function initializeApp() {
        setupEventListeners();
        await loadCustomShortcuts();
        const savedTheme = localStorage.getItem('cheatSheetTheme') || 'light';
        const savedSize = localStorage.getItem('cheatSheetSize') || 180;
        const savedSpacing = localStorage.getItem('cheatSheetSpacing') || 'default';
        const savedView = localStorage.getItem('cheatSheetView') || 'grid';
        const savedFont = localStorage.getItem('cheatSheetFont') || 'cairo';
        const savedKeysFont = localStorage.getItem('cheatSheetKeysFont') || 'default';
        const savedLang = localStorage.getItem('cheatSheetLang') || 'en';
        setTheme(savedTheme);
        setFont(savedFont);
        setKeysFont(savedKeysFont);
        updateSize(savedSize);
        setSpacing(savedSpacing);
        setView(savedView);
        setLanguage(savedLang);
    };

    initializeApp();
});
