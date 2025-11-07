// script.js
// Front-end: loads /cases.json, local retrieval, calls /api/ai, renders UI and animations
(async () => {
  // small helper to fetch cases.json
  async function loadCases() {
    try {
      const r = await fetch('/cases.json', {cache: 'no-store'});
      if (!r.ok) throw new Error('cases.json fetch failed');
      return await r.json();
    } catch (e) {
      console.warn('Could not fetch cases.json — fallback to embedded sample', e);
      return window.cases || [];
    }
  }

  const cases = await loadCases();

  // --- UI elements
  const qInput = document.getElementById('q');
  const askBtn = document.getElementById('askBtn');
  const casesList = document.getElementById('casesList');
  const advList = document.getElementById('advList');
  const lawSection = document.getElementById('lawSection');
  const suggestionText = document.getElementById('suggestionText');
  const suggestionTitle = document.getElementById('suggestionTitle');
  const chips = document.getElementById('chips');
  const fab = document.getElementById('fab');
  const chatModal = document.getElementById('chatModal');
  const msgs = document.getElementById('msgs');
  const chatInp = document.getElementById('chatInp');
  const sendChat = document.getElementById('sendChat');
  const openChat = document.getElementById('openChat');
  const closeChat = document.getElementById('closeChat');
  const floatTip = document.getElementById('floatTip');

  // quick chips
  const quicks = ['cyber abuse','defamation','data breach','stalking','online fraud'];
  quicks.forEach(k => {
    const b = document.createElement('div'); b.className = 'chip'; b.textContent = k;
    b.onclick = () => { qInput.value = k; doAsk(k); };
    chips.appendChild(b);
  });

  // simple retrieval
  function simpleMatch(query) {
    const q = query.toLowerCase().trim();
    if(!q) return [];
    const toks = q.split(/\s+/).filter(t=>t.length>2);
    return cases.filter(c => {
      const hay = ((c.title||'') + ' ' + (c.summary||'') + ' ' + (c.tags||[]).join(' ')).toLowerCase();
      return toks.some(tok => hay.includes(tok));
    });
  }

  // render functions
  function renderCases(items) {
    casesList.innerHTML = '';
    items.forEach(c => {
      const el = document.createElement('div'); el.className = 'case';
      el.dataset.caseId = c.id;
      el.innerHTML = `<div class="meta"><h4>${c.title}</h4><p>${c.summary} — <strong>${c.section}</strong></p></div>
        <div style="text-align:right">
          <small style="color:var(--muted)">${c.date}</small>
          <div style="margin-top:8px"><button class="btnSmall" data-case="${c.id}">Contact Adv.</button></div>
        </div>`;
      // hover behaviour: show floating tip with case details
      el.addEventListener('mousemove', (ev) => showTipForCase(ev, c));
      el.addEventListener('mouseenter', (ev) => showTipForCase(ev, c));
      el.addEventListener('mouseleave', hideTip);
      casesList.appendChild(el);
    });
    // animate entrance
    if (window.gsap) gsap.from('.case', {opacity:0, y:8, duration:0.45, stagger:0.06});
  }

  function renderAdv(list) {
    advList.innerHTML = '';
    list.forEach(a => {
      const el = document.createElement('div'); el.className = 'advocate';
      el.innerHTML = `<div class="avatar" data-adv="${a.email}">${a.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
        <div class="advInfo"><strong>${a.name}</strong><p>${a.expertise||'Practice: General'}</p></div>
        <div style="margin-left:auto;display:flex;flex-direction:column;gap:6px">
          <a class="btnSmall" href="mailto:${a.email}">Email</a>
          <a class="btnSmall" href="tel:${a.phone||''}">Call</a>
        </div>`;
      // avatar hover tooltip
      el.querySelector('.avatar').addEventListener('mousemove', (ev)=> showTipForAdv(ev,a));
      el.querySelector('.avatar').addEventListener('mouseenter', (ev)=> showTipForAdv(ev,a));
      el.querySelector('.avatar').addEventListener('mouseleave', hideTip);
      advList.appendChild(el);
    });
    if (window.gsap) gsap.from('#rightPanel', {opacity:0, x:12, duration:0.45});
  }

  // Tip helpers
  function showTipForCase(ev, c) {
    floatTip.innerHTML = `<strong>${c.title}</strong><div style="margin-top:6px">${c.summary}<div style="margin-top:6px"><em>${c.section}</em></div></div>`;
    floatTip.style.opacity = '1';
    positionTip(ev);
  }
  function showTipForAdv(ev, a) {
    floatTip.innerHTML = `<strong>${a.name}</strong><div style="margin-top:6px">Expertise: ${a.expertise||'General'}<div style="margin-top:6px">Email: ${a.email}</div></div>`;
    floatTip.style.opacity = '1';
    positionTip(ev);
  }
  function hideTip() { floatTip.style.opacity = '0'; }
  function positionTip(ev) {
    // clamp to viewport
    const w = floatTip.offsetWidth || 260;
    const h = floatTip.offsetHeight || 90;
    let x = ev.clientX + 16;
    let y = ev.clientY + 12;
    if (x + w > window.innerWidth - 12) x = ev.clientX - w - 16;
    if (y + h > window.innerHeight - 12) y = window.innerHeight - h - 12;
    floatTip.style.left = x + 'px';
    floatTip.style.top = y + 'px';
  }

  // contact adv helper used by buttons (global)
  window.contactAdv = (caseId) => {
    const c = cases.find(x=>x.id === caseId);
    if(!c) return alert('Case not found');
    const mail = `mailto:${c.advocate.email}?subject=Query about case ${encodeURIComponent(c.title)}&body=Hello ${encodeURIComponent(c.advocate.name)},%0A%0AI found your profile on SealLaw and would like assistance regarding "${encodeURIComponent(c.title)}".%0A%0ARegards,`;
    window.location.href = mail;
  };

  // initial render
  renderCases(cases.slice(0,3));
  renderAdv(Object.values(cases.reduce((m,c)=>{
    if(c && c.advocate && c.advocate.email) m[c.advocate.email] = {...c.advocate, expertise: (c.tags||[]).join(', ')}; return m;
  }, {})));

  // build prompt to send to AI (retrieval-augmented)
  function buildPrompt(userQuery, matched) {
    const topCases = (matched || []).slice(0,4).map(c =>
      `- ${c.title} (${c.date}) | section: ${c.section} | summary: ${c.summary} | advocate: ${c.advocate?.name || ''}`
    ).join('\n') || 'No good matches found in the local corpus.';
    return `You are a concise, helpful legal-assistant. A user asked: "${userQuery}".
Using the recent cases below, produce:
1) Short plain-language summary of possible legal sections that may apply and why.
2) Practical next steps (evidence to collect, who to contact).
3) Up to 3 recent similar cases (title & date) and the advocate name+email for contact.
If insufficient info, ask exactly what additional info (dates, location, messages) you need.
Recent cases:
${topCases}
Answer:`;
  }

  // call serverless AI endpoint
  async function callAI(prompt) {
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      });
      const j = await r.json();
      if (j.error) throw new Error((j.error||'API error') + ' ' + (j.detail||''));
      return j.text || j.generated_text || JSON.stringify(j);
    } catch (e) {
      console.error('AI call failed', e);
      return null;
    }
  }

  // main ask function
  async function doAsk(q) {
    if(!q || q.trim().length < 3) {
      // nudge animation
      if(window.gsap) gsap.fromTo('#searchCard',{y:0},{y:-6,duration:0.18,yoyo:true,repeat:1});
      return;
    }
    // local retrieval
    const matched = simpleMatch(q);
    renderCases(matched.length ? matched : cases.slice(0,3));
    renderAdv(Object.values((matched.length?matched:cases.slice(0,3)).reduce((m,c)=>{
      if(c && c.advocate && c.advocate.email) m[c.advocate.email] = {...c.advocate, expertise: (c.tags||[]).join(', ')}; return m;
    }, {})));

    lawSection.textContent = 'AI suggestion — generating...';
    suggestionText.textContent = 'Thinking...';

    const prompt = buildPrompt(q, matched);
    const ai = await callAI(prompt);
    if (ai) {
      // show AI result
      lawSection.textContent = 'AI suggestion';
      suggestionText.textContent = ai;
      // gentle animation
      if (window.gsap) gsap.fromTo('#mainResult',{opacity:0,y:8},{opacity:1,y:0,duration:0.45});
    } else {
      suggestionText.textContent = 'AI currently unavailable — showing local suggestions.';
    }
  }

  askBtn.addEventListener('click', ()=> doAsk(qInput.value));
  qInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAsk(qInput.value); });

  // Chat modal demo (simple)
  function openChatModal(){ chatModal.style.display='block'; if(window.gsap) gsap.fromTo('#chatModal',{scale:0.95,opacity:0},{scale:1,opacity:1,duration:0.28}); }
  function closeChatModal(){ if(window.gsap) gsap.to('#chatModal',{scale:0.96,opacity:0,duration:0.18,onComplete:()=>{chatModal.style.display='none'}}); }

  fab.onclick = openChatModal; openChat.onclick = openChatModal; closeChat.onclick = closeChatModal;

  function appendMsg(text, who='bot') {
    const d = document.createElement('div'); d.className = 'msg ' + (who==='user'? 'user':'bot'); d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }

  function fakeAIReply(input) {
    const matched = simpleMatch(input);
    let out = 'Quick tips:\n - Preserve evidence (screenshots, export chat / metadata)\n - Block & report offending accounts\n\nPossible sections: (see local cases below)\n';
    matched.slice(0,3).forEach(m => out += `${m.title} — ${m.date} (Adv: ${m.advocate?.name})\n`);
    out += '\n(Disclaimer: demo assistant — not a substitute for a lawyer.)';
    return out;
  }

  sendChat.addEventListener('click', ()=>{
    const t = chatInp.value.trim(); if(!t) return;
    appendMsg(t,'user'); chatInp.value = ''; appendMsg('...','bot');
    setTimeout(()=>{ msgs.lastChild.remove(); appendMsg(fakeAIReply(t),'bot'); }, 800 + Math.random()*600);
  });

  // Pay simulation
  document.getElementById('payBtn').addEventListener('click', ()=>{
    const ok = confirm('Demo: payments are simulated. OK to simulate a payment and request?');
    if (ok) alert('Payment simulated. (Demo) A lawyer will contact you at the email you send.');
  });

  // small entrance animations
  if (window.gsap) {
    gsap.from('.logo',{scale:0.6,duration:0.6,opacity:0});
    gsap.from('header h1',{x:-10,opacity:0,duration:0.6});
    gsap.from('#searchCard',{y:18,opacity:0,duration:0.7});
  }

})();
