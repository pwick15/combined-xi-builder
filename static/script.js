// Define the 'items' array outside the fetch call to make it accessible globally
let items = [];
let team1_name = null;
let team2_name = null;
let team1_url = null;
let team2_url = null;

function select_team(dropdown_elem, id) {
    const matchedItem = items.find(item => item.name === dropdown_elem.value);
    if (matchedItem) {
        const teamName = document.getElementById(`team${id}-name`);
        teamName.value = dropdown_elem.value;
        teamName.textContent = dropdown_elem.value;

        // Assign directly to global variables
        if (id === 1) {
            team1_name = matchedItem.name;
            team1_url = matchedItem.url;
        } else if (id === 2) {
            team2_name = matchedItem.name;
            team2_url = matchedItem.url;
        }

        // Update the image
        const teamImg = document.getElementById(`team${id}-img`);
        if (teamImg && matchedItem.img) {
            teamImg.src = matchedItem.img.startsWith('data:image/') 
                ? matchedItem.img 
                : `data:image/png;base64,${matchedItem.img}`;
        }
    } else {
        console.log('No match found.');
    }
}


// Function to fetch initial scrape data and populate items (this will run once)
function fetchInitialData() {
    fetch('/initial_scrape')
        .then(response => response.json())
        .then(data => {
            // Map the fetched data to the 'items' array
            items = data.map(item => ({
                name: item.team_name,
                url: item.url,
                img: item.img  // Include the Base64 image string TODO uncomment to get images back

            }));
            // Now that 'items' is populated, configure Fuse.js (this part only runs once)
            console.log(items);
            configureFuseJS();   
        })
        .catch(error => console.error('Error fetching initial scrape data:', error));
}

// Function to configure Fuse.js (this will run after initial fetch)
function configureFuseJS() {
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
            select_team(resultsDropdown, 1);
        } else if (team2_name === null) {
            select_team(resultsDropdown, 2);
        }
    });
    
}

// Call fetchInitialData on page load to fetch and populate items
fetchInitialData();

document.getElementById('reset-btn').addEventListener('click', () => {
    team1_name = null;
    team2_name = null;
    const team1DisplayName = document.getElementById('team1-name')
    team1DisplayName.textContent = "";
    team1DisplayName.value = "";
    const team2DisplayName = document.getElementById('team2-name')
    team2DisplayName.textContent = "";
    team2DisplayName.value = "";
    
});


// Button Fetch Event for '/button_scrape' endpoint
document.getElementById('fetch-lineups-btn').addEventListener('click', () => {
    // Navigate to the '/team_view' route with team1 and team2 as query parameters
    if (team1_name != null && team2_name != null){
        window.location.href = `/team_view?team1_name=${encodeURIComponent(team1_name)}&team2_name=${encodeURIComponent(team2_name)}&team1_url=${encodeURIComponent(team1_url)}&team2_url=${encodeURIComponent(team2_url)}`;
    }
});
