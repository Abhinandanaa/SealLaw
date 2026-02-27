// Global variables
let casesData = [];
let advocatesData = [];

// Load data on page start
async function init() {
    try {
        const casesResponse = await fetch('cases.json');
        casesData = await casesResponse.json();
        
        const advocatesResponse = await fetch('advocates.json');
        advocatesData = await advocatesResponse.json();
        
        console.log(`Loaded ${casesData.length} cases and ${advocatesData.length} advocates`);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Search and match cases
function findMatchingCases(userProblem) {
    const searchTerms = extractSearchTerms(userProblem);
    const userCategory = document.getElementById('problemCategory').value.toLowerCase();
    
    const scoredCases = casesData.map(caseItem => {
        let score = 0;
        
        // Category matching (high weight)
