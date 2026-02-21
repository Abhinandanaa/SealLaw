let casesData = [];
let users = JSON.parse(localStorage.getItem("sealaw_users") || "[]");

async function loadCases(){
  const res = await fetch("cases.json");
  casesData = await res.json();
}

function searchCases(){
  const query = document.getElementById("q").value.toLowerCase().trim();
  if(!query) return;

  const results = casesData.filter(c=>{
    const text = (c.title + " " + c.summary + " " + c.law.join(" ")).toLowerCase();
    return text.includes(query);
  });

  displayResults(results);
}

function displayResults(results){
  const container = document.getElementById("resultsContainer");
  container.innerHTML = "";

  if(results.length === 0){
    container.innerHTML = "No matching cases found.";
    return;
  }

  results.slice(0,10).forEach(c=>{
    const div = document.createElement("div");
    div.className="case";
    div.innerHTML = `
      <h4>${c.title}</h4>
      <p>${c.summary.substring(0,200)}...</p>
      <p><strong>Law:</strong> ${c.law.join(", ")}</p>
      <p><strong>Helpline:</strong> ${c.helpline}</p>
      <button class="small-btn" onclick="window.open('${c.reference}','_blank')">View Judgment</button>
    `;
    container.appendChild(div);
  });
}

function openModal(type){
  document.getElementById("authModal").style.display="flex";
  document.getElementById("modalTitle").innerText = type === "signin" ? "Sign In" : "Sign Up";
}

function closeModal(){
  document.getElementById("authModal").style.display="none";
}

function submitAuth(){
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;

  if(!email || !password){
    alert("All fields required.");
    return;
  }

  users.push({email,password});
  localStorage.setItem("sealaw_users", JSON.stringify(users));
  alert("Account created successfully.");
  closeModal();
}

document.addEventListener("DOMContentLoaded", loadCases);
