(async () => {

  async function loadCases() {
    try {
      const r = await fetch('cases.json', { cache: 'no-store' });
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
  const casesContainer = document.getElementById('casesContainer');

  const advocatePool = [
    "Adv. Arjun Rao","Adv. Meera Sharma","Adv. Karthik Reddy",
    "Adv. Sneha Kapoor","Adv. Vikram Iyer","Adv. Neha Desai",
    "Adv. Rahul Verma","Adv. Aditi Menon","Adv. Rohan Gupta",
    "Adv. Priya Nair","Adv. Siddharth Joshi","Adv. Kavya Reddy",
    "Adv. Manish Khanna","Adv. Ananya Rao","Adv. Rohit Kulkarni"
  ];

  function getRandomAdvocates() {
    const shuffled = [...advocatePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  function displayCases(list) {
    casesContainer.innerHTML = "";

    if (!list.length) {
      casesContainer.innerHTML = "<p>No matching cases found.</p>";
      return;
    }

    list.slice(0,6).forEach(c => {

      const selectedAdvocates = getRandomAdvocates();

      const div = document.createElement("div");
      div.className = "case";

      div.innerHTML = `
        <h4>${c.title}</h4>
        <div class="meta">${(c.summary || "").substring(0,300)}...</div>
        <div class="meta"><strong>Law:</strong> ${(c.law || []).join(", ")}</div>
        <div class="meta"><strong>Helpline:</strong> ${c.helpline || "N/A"}</div>

        <div class="meta"><strong>Advocates:</strong></div>
        ${selectedAdvocates.map(name => `
          <div class="meta">
            ${name}
            <button class="small-btn"
              onclick="window.location.href='mailto:bollempallyabhinandana@gmail.com'">
              Email
            </button>
            <button class="small-btn"
              onclick="window.location.href='tel:9885353758'">
              Call
            </button>
          </div>
        `).join("")}

        <div class="btn-row">
          <button class="small-btn"
            onclick="window.open('${c.reference}','_blank')">
            View Full Case
          </button>
        </div>
      `;

      casesContainer.appendChild(div);
    });
  }

  function searchCases() {
    const query = qInput.value.toLowerCase();

    const filtered = cases.filter(c =>
      (c.title || "").toLowerCase().includes(query) ||
      (c.summary || "").toLowerCase().includes(query) ||
      (c.law || []).join(" ").toLowerCase().includes(query)
    );

    displayCases(filtered);
  }

  if (askBtn) {
    askBtn.addEventListener("click", searchCases);
  }

  if (qInput) {
    qInput.addEventListener("keydown", e => {
      if (e.key === "Enter") searchCases();
    });
  }

  displayCases(cases.slice(0,5));

})();
