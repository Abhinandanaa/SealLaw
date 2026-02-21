(async () => {

  /* ================================
     LOAD CASES
  ================================= */
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

  /* ================================
     ADVOCATE POOL (50 NAMES)
     Auto assigned per case
  ================================= */
  const advocatePool = [
    "Adv. Arjun Rao","Adv. Meera Sharma","Adv. Karthik Reddy",
    "Adv. Sneha Kapoor","Adv. Vikram Iyer","Adv. Neha Desai",
    "Adv. Rahul Verma","Adv. Aditi Menon","Adv. Rohan Gupta",
    "Adv. Priya Nair","Adv. Siddharth Joshi","Adv. Kavya Reddy",
    "Adv. Manish Khanna","Adv. Ananya Rao","Adv. Rohit Kulkarni",
    "Adv. Divya Sharma","Adv. Abhishek Jain","Adv. Tanvi Mehta",
    "Adv. Harish Patel","Adv. Pooja Verma","Adv. Nikhil Rao",
    "Adv. Shruti Iyer","Adv. Akash Singh","Adv. Pallavi Desai",
    "Adv. Arvind Nair","Adv. Lakshmi Menon","Adv. Suraj Reddy",
    "Adv. Kriti Sharma","Adv. Sandeep Verma","Adv. Bhavana Iyer",
    "Adv. Tejas Rao","Adv. Ishita Kapoor","Adv. Vivek Jain",
    "Adv. Aparna Gupta","Adv. Varun Menon","Adv. Swathi Reddy",
    "Adv. Aman Khanna","Adv. Ritu Sharma","Adv. Gaurav Iyer",
    "Adv. Nishant Desai","Adv. Deepika Nair","Adv. Kunal Mehta",
    "Adv. Ramesh Verma","Adv. Shalini Rao","Adv. Yash Gupta",
    "Adv. Rhea Menon","Adv. Kartik Iyer","Adv. Nandini Sharma",
    "Adv. Pranav Reddy","Adv. Tania Kapoor"
  ];

  /* ================================
     DOM ELEMENTS
  ================================= */
  const qInput = document.getElementById('q');
  const askBtn = document.getElementById('askBtn');
  const casesList = document.getElementById('casesList');
  const lawSection = document.getElementById('lawSection');
  const suggestionText = document.getElementById('suggestionText');

  /* ================================
     SIMPLE SEARCH
  ================================= */
  function simpleMatch(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return cases.filter(c =>
      (c.title || "").toLowerCase().includes(q) ||
      (c.summary || "").toLowerCase().includes(q) ||
      (c.law || []).join(" ").toLowerCase().includes(q)
    );
  }

  /* ================================
     GET 3 RANDOM ADVOCATES
  ================================= */
  function getRandomAdvocates() {
    const shuffled = [...advocatePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  /* ================================
     RENDER CASES
  ================================= */
  function renderCases(items) {
    if (!casesList) return;

    casesList.innerHTML = '';

    if (!items.length) {
      casesList.innerHTML = "<p>No matching cases found.</p>";
      return;
    }

    items.slice(0, 6).forEach(c => {

      const selectedAdvocates = getRandomAdvocates();

      const el = document.createElement('div');
      el.className = 'case';

      el.innerHTML = `
        <div class="meta">
          <h4>${c.title}</h4>
          <p>${(c.summary || "").substring(0, 200)}...</p>
          <p><strong>Law:</strong> ${(c.law || []).join(', ')}</p>
          <p><strong>Helpline:</strong> ${c.helpline || "N/A"}</p>

          <p><strong>Advocates:</strong></p>
          ${selectedAdvocates.map(name => `
            <div style="margin-bottom:6px;">
              ${name}
              <button class="btnSmall"
                onclick="window.location.href='mailto:bollempallyabhinandana@gmail.com'">
                Email
              </button>
              <button class="btnSmall"
                onclick="window.location.href='tel:9885353758'">
                Call
              </button>
            </div>
          `).join("")}

          <div style="margin-top:10px;">
            <button class="btnSmall"
              onclick="window.open('${c.reference}','_blank')">
              View Full Judgment
            </button>
          </div>
        </div>
      `;

      casesList.appendChild(el);
    });
  }

  /* ================================
     AI SIMULATION
  ================================= */
  function generateSuggestion(query, matched) {

    if (!matched.length) {
      lawSection.textContent = "No match found";
      return "No strong matches found. Please refine your query.";
    }

    const first = matched[0];

    lawSection.textContent = (first.law || []).join(', ');

    return `
Possible applicable laws:
${(first.law || []).join(', ')}

Liability considerations:
${(first.liability_notes || []).map(n => "- " + n).join("\n")}

Suggested action:
${first.approach || "Consult a legal professional."}

Helpline:
${first.helpline || "Refer concerned authority."}

(Disclaimer: Educational guidance only. Consult an advocate.)
`;
  }

  /* ================================
     MAIN SEARCH
  ================================= */
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
