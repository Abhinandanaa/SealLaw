function startSearch(){
  const query = document.getElementById("searchInput").value;
  localStorage.setItem("sealaw_query", query);
  location.href="results.html";
}

function quickSearch(q){
  localStorage.setItem("sealaw_query", q);
  location.href="results.html";
}
