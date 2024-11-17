// Define the 'items' array outside the fetch call to make it accessible globally
let items = [];
let team1_name = null;
let team2_name = null;
let team1_url = null;
let team2_url = null;

// Function to fetch initial scrape data and populate items (this will run once)
function fetchInitialData() {
    fetch('/initial_scrape')
        .then(response => response.json())
        .then(data => {
            // Map the fetched data to the 'items' array
            items = data.map(item => ({
                name: item.text,  // Assuming each item has a 'text' field
                url: item.url
            }));
            
            // Now that 'items' is populated, configure Fuse.js (this part only runs once)
            console.log(items);  // This will now log the data after it's populated
            configureFuseJS();   // Call to configure Fuse.js after the initial data is fetched
        })
        .catch(error => console.error('Error fetching initial scrape data:', error));
}

// Function to configure Fuse.js (this will run after initial fetch)
function configureFuseJS() {
    // Configure Fuse.js after the 'items' array has been populated
    const fuse = new Fuse(items, {
        keys: ['name'], // Fields to search in
        threshold: 0.1, // Fuzziness of the match
    });

    // HTML Elements for search
    const searchBar = document.getElementById('search-bar');
    const resultsDropdown = document.getElementById('results');

    // Event Listener for Search Bar
    searchBar.addEventListener('input', () => {
        const query = searchBar.value; // Get the current input value
        const results = fuse.search(query); // Perform the fuzzy search

        // Clear previous results
        resultsDropdown.innerHTML = '';

        // Display the results
        results.forEach(result => {
            const option = document.createElement('option');
            option.value = result.item.name;
            option.textContent = result.item.name
            resultsDropdown.appendChild(option);
        });

        // If no results, show a "No results" message
        if (results.length === 0) {
            const option = document.createElement('option');
            option.textContent = "No results found.";
            option.disabled = true; // make it unselectable
            resultsDropdown.appendChild(option);
        }
    });

    // Event Listener for Dropdown Selection
    resultsDropdown.addEventListener('change', () => {
        if (team1_name === null) {
            team1_name = resultsDropdown.value; // get selected val
            console.log('Team 1:', team1_name);
        }
        else if (team2_name === null) {
            team2_name = resultsDropdown.value; // get selected val
            console.log('Team 2:', team2_name);
        }
        
    })
}

// Call fetchInitialData on page load to fetch and populate items
fetchInitialData();

document.getElementById('reset-btn').addEventListener('click', () => {
    console.log('Before reset Team 1: %s',team1_name);
    console.log('Before reset Team 2: %s',team2_name);
    team1_name = null;
    team2_name = null;
    console.log('After reset Team 1: %s',team1_name);
    console.log('After reset Team 2: %s',team2_name);
});


// Button Fetch Event for '/button_scrape' endpoint
document.getElementById('fetch-lineups-btn').addEventListener('click', () => {
    
    let teams = [
        { name: team1_name},
        { name: team2_name}
    ];

    teams.forEach((item, index) => {
    
        console.log('team%s', index);
        // Get the value of the search box
        // const searchValue = document.getElementById('search-bar').value;
        const searchValue = item.name;
        console.log(searchValue)
        // Find the item with the matching text
        const matchedItem = items.find(item => item.name === searchValue);
        console.log(matchedItem)
        // If a match is found, send the 'url' to the backend
        if (matchedItem) {
            if (index === 0) {
                team1_name = matchedItem.name;
                team1_url = matchedItem.url;
            }
            else if (index == 1) {
                team2_name = matchedItem.name;
                team2_url = matchedItem.url;
            }
            console.log(matchedItem.name)
            console.log(matchedItem.url)
        }
    });
    
    // Navigate to the '/team_view' route with team1 and team2 as query parameters
    window.location.href = `/team_view?team1_name=${encodeURIComponent(team1_name)}&team2_name=${encodeURIComponent(team2_name)}&team1_url=${encodeURIComponent(team1_url)}&team2_url=${encodeURIComponent(team2_url)}`;
});
