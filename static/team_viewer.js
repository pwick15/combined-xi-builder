// Function to get a query parameter by name
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Retrieve team1 and team2 from the URL query parameters
const team1_name = getQueryParameter('team1_name');
const team2_name = getQueryParameter('team2_name');
const team1_url = getQueryParameter('team1_url');
const team2_url = getQueryParameter('team2_url');

console.log(`Team 1: ${team1_name} w/ url: ${team1_url}`);
console.log(`Team 2: ${team2_name} w/ url: ${team2_url}`);

let teams = [
    { name: team1_name, url: team1_url },
    { name: team2_name, url: team2_url }
];

teams.forEach((item, index) => {
    // Fetch the data from the '/button_scrape' endpoint
    // Make the API call to the backend with the matched URL
    fetch('/button_scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: item.name,
            url: item.url 
        })  // Send the matched 'url'
    })            
        .then(response => response.json())
        .then(data => {
            // Get the list element
            const listId = `team${index + 1}-list`;  // Create dynamic ID using the index
            const list = document.getElementById(listId);
            list.innerHTML = ''; // Clear old data
            
            data.forEach(player => {
                // Add each data element into this list
                const li = document.createElement('li');
                li.textContent = `${player.name} - ${player.position}`; // Combine name and position into a string
                list.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching button scrape data:', error));
    });