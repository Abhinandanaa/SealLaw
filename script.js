let cases = [];

async function loadCases(){
  const res = await fetch("cases.json");
  cases = await res.json();
}
loadCases();

function performSearch(){
  const query = document.getElementById("searchInput").value;
  const start = performance.now();

  const vectorScores = cases.map(c=>{
    const text = (c.title + " " + c.summary).toLowerCase();
    let score = 0;
    query.toLowerCase().split(" ").forEach(word=>{
      if(text.includes(word)) score++;
    });
    return {...c,score};
  });

  const sorted = vectorScores.sort((a,b)=>b.score-a.score).slice(0,5);

  const end = performance.now();

  localStorage.setItem("sealaw_results",JSON.stringify(sorted));
  localStorage.setItem("sealaw_query",query);
  localStorage.setItem("sealaw_lag",(end-start).toFixed(2));

  location.href="results.html";
}

if(window.location.pathname.includes("results")){
  const results = JSON.parse(localStorage.getItem("sealaw_results")) || [];
  const query = localStorage.getItem("sealaw_query");
  const lag = localStorage.getItem("sealaw_lag");

  const container = document.getElementById("resultsContainer");

  results.forEach(r=>{
    const div=document.createElement("div");
    div.innerHTML=`<h4>${r.title}</h4><p>${r.summary.substring(0,120)}...</p>`;
    div.onclick=()=>showPreview(r,query,lag);
    container.appendChild(div);
  });
}

function showPreview(caseData,query,lag){
  document.getElementById("casePreview").innerHTML=`
    <h3>${caseData.title}</h3>
    <p><strong>Citation:</strong> ${caseData.reference}</p>
    <p>${caseData.summary}</p>
  `;

  document.getElementById("aiExplanation").innerHTML=`
    Based on your query "<b>${query}</b>", this case is relevant because it discusses ${caseData.law.join(", ")}.
  `;

  document.getElementById("backendLogs").innerHTML=`
    Embedding simulation: keyword scoring <br>
    Vector matches: ${caseData.score} <br>
    Query processing time: ${lag} ms
  `;
}
