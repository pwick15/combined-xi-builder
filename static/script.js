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
                url: item.url,
                img: item.img  // Include the Base64 image string

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
            const matchedItem = items.find(item => item.name === resultsDropdown.value);
            console.log(matchedItem)
            // If a match is found, send the 'url' to the backend
            if (matchedItem) {
                const team1Name = document.getElementById('team1-name');
                console.log('Team 1:', team1Name.value);
                team1Name.value = resultsDropdown.value;
                team1Name.textContent = resultsDropdown.value;
                console.log('Team 1:', team1Name.value);
                team1_name = matchedItem.name;
                team1_url = matchedItem.url;
                console.log(matchedItem.name)
                console.log(matchedItem.url)

                // Update the image with the matched item's image URL
                const team1Img = document.getElementById('team1-img');
                if (team1Img && matchedItem.img) {
                    console.log('Matched Item Image URL:', matchedItem.img);
                
                    // Check if the image is Base64
                    if (matchedItem.img.startsWith('data:image/')) {
                        // It's already a valid data URI
                        team1Img.src = matchedItem.img;
                    } else {
                        // It's raw Base64, prepend the data URI scheme
                        team1Img.src = `data:image/png;base64,${matchedItem.img}`;
                    }
                
                    console.log('Updated Image Src:', team1Img.src);
                }
                
            }

        }
        else if (team2_name === null) {
            team2_name = resultsDropdown.value; // get selected val
            const matchedItem = items.find(item => item.name === resultsDropdown.value);
            console.log(matchedItem)
            // If a match is found, send the 'url' to the backend
            if (matchedItem) {
                const team2Name = document.getElementById('team2-name');
                console.log('Team 2:', team2Name.value);
                team2Name.value = resultsDropdown.value;
                team2Name.textContent = resultsDropdown.value;
                console.log('Team 2:', team2Name.value);
                team2_name = matchedItem.name;
                team2_url = matchedItem.url;
                console.log(matchedItem.name)
                console.log(matchedItem.url)
                // update image
                const team2Img = document.getElementById('team2-img');
                if (team2Img && matchedItem.img) {
                    console.log('Matched Item Image URL:', matchedItem.img);
                
                    // Check if the image is Base64
                    if (matchedItem.img.startsWith('data:image/')) {
                        // It's already a valid data URI
                        team2Img.src = matchedItem.img;
                    } else {
                        // It's raw Base64, prepend the data URI scheme
                        team2Img.src = `data:image/png;base64,${matchedItem.img}`;
                    }
                
                    console.log('Updated Image Src:', team2Img.src);
                }
            }
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
    // Navigate to the '/team_view' route with team1 and team2 as query parameters
    window.location.href = `/team_view?team1_name=${encodeURIComponent(team1_name)}&team2_name=${encodeURIComponent(team2_name)}&team1_url=${encodeURIComponent(team1_url)}&team2_url=${encodeURIComponent(team2_url)}`;
});
