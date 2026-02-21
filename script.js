(async () => {

  async function loadCases() {
    try {
      const r = await fetch('/cases.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('cases.json fetch failed');
      return await r.json();
    } catch (e) {
      console.warn('Failed to load cases.json', e);
      return [];
    }
  }

  const cases = await loadCases();

  const qInput = document.getElementById('q');
  const askBtn = document.getElementById('askBtn');
  const casesList = document.getElementById('casesList');
  const lawSection = document.getElementById('lawSection');
  const suggestionText = document.getElementById('suggestionText');

  // --- SIMPLE SEARCH
  function simpleMatch(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return cases.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.law.join(" ").toLowerCase().includes(q)
    );
  }

  // --- RENDER CASES
  function renderCases(items) {
    if (!casesList) return;

    casesList.innerHTML = '';

    items.slice(0, 6).forEach(c => {
      const el = document.createElement('div');
      el.className = 'case';

      el.innerHTML = `
        <div class="meta">
          <h4>${c.title}</h4>
          <p>${c.summary.substring(0, 200)}...</p>
          <p><strong>Law:</strong> ${c.law.join(', ')}</p>
          <p><strong>Helpline:</strong> ${c.helpline}</p>
          <div style="margin-top:8px;">
            <button class="btnSmall" onclick="window.open('${c.reference}','_blank')">
              View Full Judgment
            </button>
          </div>
        </div>
      `;

      casesList.appendChild(el);
    });
  }

  // --- AI SIMULATION (LOCAL ONLY)
  function generateSuggestion(query, matched) {
    if (!matched.length) {
      return "No strong matches found. Please refine your query with more details.";
    }

    const first = matched[0];

    lawSection.textContent = first.law.join(', ');

    return `
Possible applicable laws:
${first.law.join(', ')}

Liability considerations:
${first.liability_notes.map(n => "- " + n).join("\n")}

Suggested action:
${first.approach}

Helpline:
${first.helpline}

(Disclaimer: Educational guidance only. Consult an advocate.)
`;
  }

  // --- MAIN ASK FUNCTION
  function doAsk(query) {
    if (!query || query.trim().length < 3) return;

    const matched = simpleMatch(query);

    renderCases(matched);

    const suggestion = generateSuggestion(query, matched);

    if (suggestionText) suggestionText.textContent = suggestion;
  }

  if (askBtn) {
    askBtn.addEventListener('click', () => doAsk(qInput.value));
  }

  if (qInput) {
    qInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doAsk(qInput.value);
    });
  }

})();
