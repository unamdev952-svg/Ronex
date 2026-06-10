// Initialize System UI Controls
lucide.createIcons();

function toggleSidebar(open) {
    const sb = document.getElementById('sidebar');
    sb.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
}

function openSettings(open) {
    const modal = document.getElementById('settingsModal');
    if(open) { modal.classList.remove('hidden'); lucide.createIcons(); }
    else modal.classList.add('hidden');
}

function switchTab(tabId) {
    ['general', 'personalization', 'api'].forEach(t => {
        document.getElementById(`tabContent-${t}`).classList.add('hidden');
        document.getElementById(`tabBtn-${t}`).className = "flex items-center gap-2 p-2.5 rounded-xl font-semibold text-zinc-400 hover:bg-zinc-800/40 text-left w-full";
    });
    document.getElementById(`tabContent-${tabId}`).classList.remove('hidden');
    document.getElementById(`tabBtn-${tabId}`).className = "flex items-center gap-2 p-2.5 rounded-xl font-semibold bg-zinc-800 text-white text-left w-full";
    lucide.createIcons();
}

function changeAccent(hex) {
    document.documentElement.style.setProperty('--accent-color', hex);
}

// Data Stream Persistence Frameworks
function saveTokens() {
    const config = {
        gemini: document.getElementById('keyGemini').value,
        tavily: document.getElementById('keyTavily').value,
        hf: document.getElementById('keyHF').value
    };
    localStorage.setItem('__ronex_api_vault', JSON.stringify(config));
    alert('Tokens globally compiled into localized cache container.');
    openSettings(false);
}

function saveProfile() {
    const prof = {
        name: document.getElementById('profileName').value,
        bio: document.getElementById('profileBio').value
    };
    localStorage.setItem('__ronex_user_profile', JSON.stringify(prof));
    alert('User Context personalization state initialized.');
    openSettings(false);
}

// On-load hydration config extraction
window.addEventListener('DOMContentLoaded', () => {
    const cachedVault = localStorage.getItem('__ronex_api_vault');
    if(cachedVault) {
        const d = JSON.parse(cachedVault);
        document.getElementById('keyGemini').value = d.gemini || '';
        document.getElementById('keyTavily').value = d.tavily || '';
        document.getElementById('keyHF').value = d.hf || '';
    }
    const cachedProfile = localStorage.getItem('__ronex_user_profile');
    if(cachedProfile) {
        const p = JSON.parse(cachedProfile);
        document.getElementById('profileName').value = p.name || '';
        document.getElementById('profileBio').value = p.bio || '';
    }
    renderHistory();
});

// Hardware Video Overlay Drivers Panel
let webStream = null;
async function toggleLiveMode(active) {
    const overlay = document.getElementById('liveOverlay');
    const video = document.getElementById('liveWebcam');
    if(active) {
        overlay.classList.remove('hidden');
        try {
            webStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
            if(video) video.srcObject = webStream;
        } catch (e) {
            console.error("Camera node hardware link error: ", e);
            toggleLiveMode(false);
        }
    } else {
        overlay.classList.add('hidden');
        if(webStream) { webStream.getTracks().forEach(t => t.stop()); webStream = null; }
    }
}

function injectPrompt(txt) {
    document.getElementById('userInput').value = txt;
    sendMessage();
}

// Transaction Orchestration Flow Process Layer
async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if(!text) return;

    document.getElementById('welcomeScreen').classList.add('hidden');
    appendBubble(text, 'user');
    input.value = '';

    const vault = JSON.parse(localStorage.getItem('__ronex_api_vault') || '{}');
    const profile = JSON.parse(localStorage.getItem('__ronex_user_profile') || '{}');
    
    if(!vault.gemini) {
        appendBubble("System Node Config Error: Operational matrix requires active keys. Head to Settings > API Credentials panel to load secret arrays.", 'ronex');
        return;
    }

    const cleanInput = text.toLowerCase();
    
    // IMAGE ROUTER: Text-To-Image Model Engine
    if(cleanInput.includes("generate an image") || cleanInput.includes("create a photo")) {
        if(!vault.hf) { appendBubble("HuggingFace Generation Matrix block structural error: Bind valid endpoint signature tokens.", 'ronex'); return; }
        appendBubble("Synthesizing context data arrays into generative imagery structures... stand by.", 'ronex-loading');
        try {
            const hfRes = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
                headers: { Authorization: `Bearer ${vault.hf}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: text })
            });
            removeLoadingBubble();
            const blob = await hfRes.blob();
            const imgUrl = URL.createObjectURL(blob);
            appendImageBubble(imgUrl);
            saveHistoryNode(text);
        } catch (e) {
            removeLoadingBubble();
            appendBubble("Inference Engine Canvas pipeline broken. Re-validate HuggingFace access arrays.", 'ronex');
        }
        return;
    }

    // WEB SEARCH ROUTER: Ground Truth Web Sync
    let groundWebKnowledgeContext = "";
    if(vault.tavily && (cleanInput.includes("news") || cleanInput.includes("current") || cleanInput.includes("today") || cleanInput.includes("weather"))) {
        try {
            const tavRes = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: vault.tavily, query: text, search_depth: "basic" })
            });
            const d = await tavRes.json();
            groundWebKnowledgeContext = JSON.stringify(d.results);
        } catch(e) { console.error("Search node bypass executed.", e); }
    }

    // CORE INTEL ROUTER: Gemini Multimodal Matrix
    appendBubble("Processing synaptic parameters...", 'ronex-loading');
    try {
        const sysContext = `You are RONEX, an advanced computing system interface framework. User Identity Profile Handle: ${profile.name || 'User'}. User Custom Directives Memory constraints: ${profile.bio || 'None'}. Current structural live web context data array: [${groundWebKnowledgeContext}]. Output clean markdown responses natively.`;
        
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${vault.gemini}`;
        const res = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }],
                systemInstruction: { parts: [{ text: sysContext }] }
            })
        });
        
        removeLoadingBubble();
        const output = await res.json();
        const resText = output.candidates[0].content.parts[0].text;
        appendBubble(resText, 'ronex');
        saveHistoryNode(text);
    } catch(e) {
        removeLoadingBubble();
        appendBubble("Core response generation fault block compiled. Verify runtime network node endpoints or billing tier status.", 'ronex');
    }
}

function appendBubble(txt, sender) {
    const container = document.getElementById('chatContainer');
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} ${sender === 'ronex-loading' ? 'id-loading-node' : ''}`;
    
    const isUser = sender === 'user';
    wrapper.innerHTML = `
        <div class="p-4 rounded-2xl max-w-[85%] leading-relaxed ${isUser ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent border-0 text-zinc-300'}">
            <p class="whitespace-pre-wrap text-sm">${txt}</p>
        </div>
    `;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function appendImageBubble(url) {
    const container = document.getElementById('chatContainer');
    const wrapper = document.createElement('div');
    wrapper.className = "flex justify-start";
    wrapper.innerHTML = `
        <div class="p-2 bg-zinc-900/50 rounded-2xl max-w-[85%] border border-zinc-800 shadow-xl">
            <img src="${url}" class="rounded-xl max-w-full h-auto" alt="AI Generated Graphic Matrix"/>
        </div>
    `;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function removeLoadingBubble() {
    const node = document.querySelector('.id-loading-node');
    if(node) node.remove();
}

function saveHistoryNode(txt) {
    let hist = JSON.parse(localStorage.getItem('__ronex_chat_history') || '[]');
    if(!hist.includes(txt)) {
        hist.unshift(txt);
        if(hist.length > 10) hist.pop();
        localStorage.setItem('__ronex_chat_history', JSON.stringify(hist));
        renderHistory();
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    let hist = JSON.parse(localStorage.getItem('__ronex_chat_history') || '[]');
    hist.forEach(h => {
        const row = document.createElement('div');
        row.className = "p-2.5 truncate rounded-xl cursor-pointer text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition text-xs flex gap-2 items-center";
        row.innerHTML = `<i data-lucide="message-square" class="w-3.5 h-3.5 opacity-60"></i> <span>${h}</span>`;
        row.onclick = () => injectPrompt(h);
        list.appendChild(row);
    });
    lucide.createIcons();
}

function clearChat() {
    document.getElementById('chatContainer').innerHTML = '';
    document.getElementById('chatContainer').appendChild(document.getElementById('welcomeScreen'));
    document.getElementById('welcomeScreen').classList.remove('hidden');
}
  
