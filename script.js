document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("analyzeBtn");
  const input = document.getElementById("issueInput");
  const output = document.getElementById("output");

  let cases = [];

  // Load cases.json
  fetch("cases.json")
    .then(response => response.json())
    .then(data => {
      cases = data;
    })
    .catch(error => {
      console.error("Error loading cases:", error);
      output.innerHTML = "<p style='color:red;'>Failed to load legal database. Try refreshing.</p>";
    });

  button.addEventListener("click", () => {
    const userInput = input.value.toLowerCase();
    let found = false;

    for (const item of cases) {
      const match = item.keywords.some(keyword => userInput.includes(keyword));
      if (match) {
        output.innerHTML = `
          <h3>Possible Laws:</h3>
          <ul>${item.laws.map(law => `<li>${law}</li>`).join("")}</ul>
          <h3>Explanation:</h3>
          <p>${item.explanation}</p>
          <h3>Risk Level:</h3>
          <p>${item.risk}</p>
          <a href="${item.link}" target="_blank">Cyber Crime Reporting</a>
        `;
        found = true;
        break;
      }
    }

    if (!found) {
      output.innerHTML = `
        <p>Sorry, we couldn’t find an exact match. Please rephrase or try a different issue.</p>
      `;
    }
  });
});
