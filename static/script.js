// Define the 'items' array outside the fetch call to make it accessible globally
let items = [];

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
    const resultsList = document.getElementById('results');

    // Event Listener for Search Bar
    searchBar.addEventListener('input', () => {
        const query = searchBar.value; // Get the current input value
        const results = fuse.search(query); // Perform the fuzzy search

        // Clear previous results
        resultsList.innerHTML = '';

        // Display the results
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result.item.name;
            resultsList.appendChild(li);
        });

        // If no results, show a "No results" message
        if (results.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No results found.";
            resultsList.appendChild(li);
        }
    });
}

// Call fetchInitialData on page load to fetch and populate items
fetchInitialData();

// Button Fetch Event for '/button_scrape' endpoint
document.getElementById('fetch-data').addEventListener('click', () => {

    // Get the value of the search box
    const searchValue = document.getElementById('search-bar').value;
    console.log(searchValue)
    // Find the item with the matching text
    const matchedItem = items.find(item => item.name === searchValue);
    console.log(matchedItem)
    // If a match is found, send the 'url' to the backend
    if (matchedItem) {
        const url = matchedItem.url;
        console.log(url)

        // Fetch the data from the '/button_scrape' endpoint
        // Make the API call to the backend with the matched URL
        fetch('/button_scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })  // Send the matched 'url'
        })            
            .then(response => response.json())
            .then(data => {
                // Get the list element
                const list = document.getElementById('data-list');
                list.innerHTML = ''; // Clear old data
                
                data.forEach(player => {
                    // Add each data element into this list
                    const li = document.createElement('li');
                    li.textContent = `${player.name} - ${player.position}`; // Combine name and position into a string
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching button scrape data:', error));
        }
});
