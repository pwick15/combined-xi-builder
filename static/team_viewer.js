// Messages for the loading screen
const messages = [
    "Initializing...",
    "Loading assets...",
    "Preparing data...",
    "Almost done..."
];

let messageIndex = 0;
const messageElement = document.getElementById("loading-message");

// Function to cycle through messages
function cycleMessages() {
    messageElement.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;
}

// Start cycling messages
let messageInterval = setInterval(cycleMessages, 3000);

// Show the loading page and hide content
document.getElementById('loading-page').style.display = 'flex';
document.getElementById('content-container').style.display = 'none';
let both_teams = [];
let GKS = [];
let DEFS = [];
let MIDS = [];
let FORS = [];

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

// Fetch the data from the '/button_scrape' endpoint
// Make the API call to the backend with the matched URL


fetch('/button_scrape', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        team1_name: team1_name,
        team1_url: team1_url,
        team2_name: team2_name,
        team2_url: team2_url
    })  // Send the matched 'url'
})   
    .then(response => response.json())
    .then(data => {
        both_teams = data.both_teams;
        console.log(both_teams)

        document.getElementById('content-container').style.display = 'block';
        document.getElementById('loading-page').style.display = 'none';
    
        // Stop cycling messages
        clearInterval(messageInterval);
    })
    .catch(error => {
        console.error('Error fetching initial scrape data:', error);

        // Hide the loading page (optional: show an error message)
        document.getElementById('loading-page').style.display = 'none';
        clearInterval(messageInterval);
    });         
    

document.getElementById('select-gk-btn').addEventListener('click', () => {
    select_player(GKS, "GK", 'selected-gk', 'selected-gk-img')
});

document.getElementById('select-rb-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'selected-rb', 'selected-rb-img')   
});

document.getElementById('select-cb1-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'selected-cb1', 'selected-cb1-img')   
});

document.getElementById('select-cb2-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'selected-cb2', 'selected-cb2-img')   
});

document.getElementById('select-lb-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'selected-lb', 'selected-lb-img')   
});

document.getElementById('select-cdm-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'selected-cdm', 'selected-cdm-img')   
});

document.getElementById('select-cm-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'selected-cm', 'selected-cm-img')   
});

document.getElementById('select-cam-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'selected-cam', 'selected-cam-img')   
});

document.getElementById('select-lw-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'selected-lw', 'selected-lw-img')   
});

document.getElementById('select-rw-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'selected-rw', 'selected-rw-img')   
});

document.getElementById('select-st-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'selected-st', 'selected-st-img')   
});


function select_player(pos_list, target_pos_str, pos_html_id, pos_img_html_id) {
    
    // Dynamically create a new select element for GK selection
    const select = document.createElement('select');
    select.innerHTML = '<option value="" disabled selected>Select a player</option>';

    if (pos_list.length === 0) {
        console.log(pos_list);
        both_teams.forEach(player => {
            if (player.position === target_pos_str) {
                pos_list.push(player);
            }
        })
    }
    console.log(pos_list);

    pos_list.forEach(player => {
        const option = document.createElement('option');
        option.value = player.player_name;
        option.textContent = `${player.player_name}, ${player.team_name}`;
        select.appendChild(option);
    });

    // Append to the body or a container
    const container = document.getElementById('select-container');
    container.innerHTML = ''; // Clear previous selections
    container.appendChild(select);

    // Add event listener for selection change
    select.addEventListener('change', () => {
        const selectedPlayer = document.getElementById(pos_html_id);
        selectedPlayer.textContent = select.value;
        const matchedItem = pos_list.find(item => item.player_name === select.value);
        console.log(matchedItem);


        const selectedPlayerImg = document.getElementById(pos_img_html_id);
        if (selectedPlayerImg && matchedItem.img) {
            selectedPlayerImg.src = matchedItem.img.startsWith('data:image/') 
            ? matchedItem.img 
            : `data:image/png;base64,${matchedItem.img}`;
        }
    });
}