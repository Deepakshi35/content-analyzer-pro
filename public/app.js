const analyzeBtn = document.getElementById('analyzeBtn');
const contentInput = document.getElementById('contentInput');
const resultsPanel = document.getElementById('resultsPanel');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btnText');
const errorMsg = document.getElementById('errorMsg');

// Result Elements
const engagementScore = document.getElementById('engagementScore');
const categoryBadge = document.getElementById('categoryBadge');
const tagsContainer = document.getElementById('tagsContainer');
const tipsList = document.getElementById('tipsList');

analyzeBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();
    if (!content) {
        showError("Please enter some content to analyze first.");
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error('Analysis failed.');
        
        const data = await response.json();
        renderResults(data);
        
    } catch (error) {
        showError("An error occurred. Make sure your server is running and the API key is valid.");
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(isLoading) {
    if (isLoading) {
        spinner.classList.remove('hidden');
        btnText.innerText = 'Analyzing Content...';
        analyzeBtn.classList.add('opacity-80', 'cursor-not-allowed');
        errorMsg.classList.add('hidden');
        resultsPanel.classList.add('hidden');
        resultsPanel.classList.remove('flex');
    } else {
        spinner.classList.add('hidden');
        btnText.innerText = 'Analyze & Score';
        analyzeBtn.classList.remove('opacity-80', 'cursor-not-allowed');
    }
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
}

function renderResults(data) {
    // Reveal the panel with a flex display
    resultsPanel.classList.remove('hidden');
    resultsPanel.classList.add('flex');

    // Animate numbers (simple pop-in effect)
    engagementScore.innerText = data.engagementScore || "0";
    engagementScore.parentElement.classList.add('animate-pulse');
    setTimeout(() => engagementScore.parentElement.classList.remove('animate-pulse'), 500);

    categoryBadge.innerText = data.category || "Uncategorized";

    // Populate Tags (Dark Theme UI)
    tagsContainer.innerHTML = '';
    (data.tags || []).forEach(tag => {
        const span = document.createElement('span');
        const cleanTag = tag.replace(/#/g, '').trim(); 
        
        // Premium dark mode tags with hover effects
        span.className = "px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-xl text-sm font-semibold border border-indigo-500/20 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-indigo-500/20 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-indigo-500/20 cursor-default";
        span.innerText = `#${cleanTag}`;
        tagsContainer.appendChild(span);
    });

    // Populate Tips (Dark Theme UI)
    tipsList.innerHTML = '';
    (data.tips || []).forEach(tip => {
        const li = document.createElement('li');
        
        // Premium dark mode list items with hover float
        li.className = "flex items-start gap-4 text-sm text-slate-300 bg-slate-800/60 p-4.5 md:p-5 rounded-2xl border border-slate-700/50 shadow-md transition-all duration-300 hover:bg-slate-700/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 group";
        
        li.innerHTML = `
            <div class="p-2 bg-slate-900 rounded-lg shadow-inner group-hover:bg-purple-500/20 transition-colors duration-300 flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <span class="leading-relaxed font-medium pt-1">${tip}</span>
        `;
        tipsList.appendChild(li);
    });
}