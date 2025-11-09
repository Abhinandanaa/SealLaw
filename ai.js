// ai.js
// Lightweight "AI alive" UI — no paid APIs required.
// - Simulates typing and analysis spinner
// - Generates tags from user input
// - Renders response cards and similar cases (uses /cases.json fallback)
// - Adds sample advocate "Adv. Sai Reddy"

(() => {
  /* ---------- CONFIG & FALLBACK DATA ---------- */
  const fallbackCases = [
    {
      id: "case-cyber-1",
      title: "State vs. R. Kumar — Cyber Harassment",
      summary: "Abusive messages and persistent threats via social media.",
      laws: "IT Act — Cyber Harassment provisions (example)",
      date: "2025-03-12",
      tags: ["cyber harassment", "stalking"]
    },
    {
      id: "case-defam-1",
      title: "A vs B — Social Media Defamation",
      summary: "False posts that damaged reputation; criminal & civil remedies.",
      laws: "Section 499/500 IPC",
      date: "2025-04-22",
      tags: ["defamation", "reputation"]
    },
    {
      id: "case-data-1",
      title: "XYZ Corp vs User — Data Breach Claim",
      summary: "Unauthorized disclosure of personal data by an employee leading to claim.",
      laws: "IT Act — Data protection clauses (example)",
      date: "2024-11-09",
      tags: ["data breach","privacy"]
    }
  ];

  const sampleAdvocate = {
    name: "Adv. Sai Reddy",
    initials: "SR",
    specialties: ["cyber","privacy","stalking"],
    email: "sai@example.com",
    phone: "+91-90000-00000"
  };

  /* ---------- DOM SELECTORS (these IDs must exist in index.html) ---------- */
  const userQuery = document.getElementById("userQuery");
  const askBtn = document.getElementById("askBtn");
  const aiStatus = document.getElementById("aiStatus");
  const responses = document.getElementById("responses");
  const advocatesList = document.getElementById("advocatesList");

  /* ---------- LOAD cases.json if present (non-blocking) ---------- */
  let casesDB = fallbackCases;
  fetch("/cases.json").then(r => {
    if (!r.ok) throw new Error("no cases");
    return r.json();
  }).then(data => {
    if (Array.isArray(data) && data.length) casesDB = data;
  }).catch(()=>{/* silent fallback */});

  /* ---------- HELPERS ---------- */
  function safeText(t){ return (t||"").toString(); }

  // Small tag map for nicer suggestions
  const KEYWORDS = {
    "harass": "cyber harassment",
    "harassment": "cyber harassment",
    "stalk": "stalking",
    "defam": "defamation",
    "defame": "defamation",
    "privacy": "privacy",
    "leak": "data breach",
    "breach": "data breach",
    "fraud": "online fraud",
    "abuse": "cyber abuse",
    "threat": "threats",
    "dox": "doxxing",
    "doxx": "doxxing"
  };

  function generateTags(text){
    if(!text) return [];
    const lower = text.toLowerCase();
    const set = new Set();
    Object.keys(KEYWORDS).forEach(k => { if(lower.includes(k)) set.add(KEYWORDS[k]); });
    if(set.size===0){
      // fallback: top words
      const words = lower.split(/\W+/).filter(w=>w.length>3).slice(0,3);
      words.forEach(w=>set.add(w));
    }
    return Array.from(set);
  }

  function showTyping(){
    if(!aiStatus) return;
    aiStatus.innerHTML = `
      <div class="ai-typing" role="status" aria-live="polite">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        <div class="ai-analysing">AI is analyzing your query…</div>
      </div>
    `;
  }
  function clearStatus(){ if(aiStatus) aiStatus.innerHTML = ""; }

  function renderResponseCard(title, innerHtml, meta = {}){
    if(!responses) return null;
    const card = document.createElement("div");
    card.className = "response-card card";
    card.innerHTML = `
      <div class="card-head"><strong>${title}</strong>
        <span class="meta-date">${meta.date || ""}</span></div>
      <div class="card-body">${innerHtml}</div>
    `;
    responses.prepend(card);
    // trigger transition
    requestAnimationFrame(()=> card.classList.add("visible"));
    return card;
  }

  function findSimilarCases(tags){
    if(!tags || tags.length===0) return [];
    return casesDB.map(c=>{
      const score = (c.tags||[]).reduce((a,t)=> a + (tags.includes(t)?1:0), 0);
      return {...c,score};
    }).filter(x => x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  function typeText(el, text, speed=16){
    return new Promise(resolve => {
      el.textContent = "";
      let i=0;
      const id = setInterval(()=> {
        el.textContent += text[i++] || "";
        if(i>text.length) { clearInterval(id); resolve(); }
      }, speed);
    });
  }

  /* ---------- ADD ADVOCATE (idempotent) ---------- */
  function addAdvCard(adv){
    if(!advocatesList) return;
    if(document.querySelector(`[data-adv-email="${adv.email}"]`)) return;
    const card = document.createElement("div");
    card.className = "adv-card";
    card.dataset.advEmail = adv.email;
    card.innerHTML = `
      <div class="adv-icon">${adv.initials}</div>
      <div class="adv-info">
        <div class="adv-name">${adv.name}</div>
        <div class="adv-special">${adv.specialties.join(", ")}</div>
      </div>
      <div class="adv-actions">
        <a href="mailto:${adv.email}" class="adv-link">Email</a>
        <a href="tel:${adv.phone}" class="adv-link">Call</a>
      </div>
    `;
    advocatesList.prepend(card);
  }
  addAdvCard(sampleAdvocate);

  /* ---------- MAIN: produce faux AI answer ---------- */
  async function produceAnswer(query){
    const q = safeText(query).trim();
    if(!q) return;
    // small UI change on button done in YOUR script.js, we only do responses here
    showTyping();

    const tags = generateTags(q);
    const tagHtml = `<div class="generated-tags">Suggested tags: ${tags.map(t=>`<span class="chip">${t}</span>`).join(" ")}</div>`;
    renderResponseCard("Identified tags", tagHtml);

    // believable analysis delay
    await sleep(700 + Math.random() * 900);

    clearStatus();

    // main answer content
    const lead = `Based on your description this relates to ${tags.join(", ")}. `;
    const advice = `Immediate steps: document screenshots, preserve metadata, avoid direct engagement, and consider a quick consultation. `;
    const lawRef = `Possible laws: IT Act (cyber offences) and relevant IPC sections depending on the facts. `;
    const contact = `You can contact a listed advocate for a consultation — e.g., Adv. Sai Reddy on the right.`;

    const full = lead + advice + lawRef + contact;

    const card = renderResponseCard("SealLaw — Suggested next steps", `<div class="aiReply"></div>`);
    const replyEl = card.querySelector(".aiReply");
    await typeText(replyEl, full, 16);

    // add similar cases if any
    const sims = findSimilarCases(tags);
    if(sims.length){
      const list = document.createElement("div");
      list.className = "similar-cases";
      list.innerHTML = "<h4>Relevant cases</h4>" + sims.map(s=>`
        <div class="case-item small">
          <div class="case-title">${s.title}</div>
          <div class="case-sub">${s.summary || ""} — <em>${s.laws || ""}</em></div>
        </div>`).join("");
      card.querySelector(".card-body").appendChild(list);
    }
  }

  /* ---------- EXPORT hook for other scripts ---------- */
  window.SealLawAI = {
    produceAnswer
  };

  /* ---------- small accessibility helper ---------- */
  if(responses) responses.setAttribute("aria-live","polite");

})();
