let casesData = [];
let currentPage = 1;
let perPage = 5;

const advocatePool = [
  {name:"Aditi Rao",email:"bollempallyabhinandana@gmail.com",phone:"9885353758"},
  {name:"Rohan Mehta",email:"bollempallyabhinandana@gmail.com",phone:"9885353758"},
  {name:"Sneha Kapoor",email:"bollempallyabhinandana@gmail.com",phone:"9885353758"},
  {name:"Arjun Verma",email:"bollempallyabhinandana@gmail.com",phone:"9885353758"},
  {name:"Neha Sharma",email:"bollempallyabhinandana@gmail.com",phone:"9885353758"}
];

async function loadCases(){
  const res = await fetch("cases.json");
  casesData = await res.json();
}

function searchCases(){
  const query = document.getElementById("q").value.toLowerCase();
  const year = document.getElementById("yearFilter").value;
  const court = document.getElementById("courtFilter").value;

  let filtered = casesData.filter(c=>{
    const text = (c.title + c.summary + c.law.join(" ")).toLowerCase();
    let match = text.includes(query);
    if(year) match = match && c.year == year;
    if(court) match = match && c.court == court;
    return match;
  });

  renderCases(filtered);
}

function renderCases(list){
  const container = document.getElementById("resultsContainer");
  container.innerHTML="";
  const start = (currentPage-1)*perPage;
  const end = start+perPage;
  const pageData = list.slice(start,end);

  pageData.forEach((c,i)=>{
    const adv1 = advocatePool[(i)%advocatePool.length];
    const adv2 = advocatePool[(i+1)%advocatePool.length];

    container.innerHTML+=`
      <div class="case">
        <h4>${c.title}</h4>
        <p>${c.summary.substring(0,200)}...</p>
        <p><strong>Law:</strong> ${c.law.join(", ")}</p>
        <p><strong>Advocates:</strong> ${adv1.name}, ${adv2.name}</p>
        <button onclick="window.open('${c.reference}','_blank')">View Judgment</button>
      </div>
    `;
  });

  renderPagination(list.length);
}

function renderPagination(total){
  const pages = Math.ceil(total/perPage);
  const div = document.getElementById("pagination");
  div.innerHTML="";
  for(let i=1;i<=pages;i++){
    div.innerHTML+=`<button onclick="goPage(${i})">${i}</button>`;
  }
}

function goPage(p){
  currentPage=p;
  searchCases();
}

function openModal(type){
  document.getElementById("authModal").style.display="flex";
  document.getElementById("modalTitle").innerText = type==="signin"?"Sign In":"Sign Up";
}

function closeModal(){
  document.getElementById("authModal").style.display="none";
}

function submitAuth(){
  const email=document.getElementById("authEmail").value;
  const password=document.getElementById("authPassword").value;
  if(!email.includes("@")){alert("Valid email required");return;}
  if(password.length<6){alert("Password must be 6+ characters");return;}
  localStorage.setItem("sealaw_user",JSON.stringify({email}));
  alert("Account created successfully.");
  closeModal();
}

document.addEventListener("DOMContentLoaded",loadCases);
