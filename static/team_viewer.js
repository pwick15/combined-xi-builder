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
let team1_img = null;
let team2_img = null;
let selected_team = {
    "gk": 0,  // Goalkeeper
    "lb": 0,  // Left Back
    "cb1": 0, // Center Back 1
    "cb2": 0, // Center Back 2
    "rb": 0,  // Right Back
    "cdm": 0, // Central Defensive Midfielder
    "cm": 0,  // Central Midfielder
    "cam": 0, // Central Attacking Midfielder
    "lw": 0,  // Left Winger
    "rw": 0,  // Right Winger
    "st": 0   // Striker
  };
  
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

fetch('/get_chosen_team_badges', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        team1_url: team1_url,
        team2_url: team2_url
    })  // Send the matched 'url'
})   
    .then(response => response.json())
    .then(data => {
        console.log('logging team badge retrieve')
        console.log(data)
        team1_img = data[0].img
        console.log('successful save img1')
        team2_img = data[1].img
        console.log('successful save img2')


        // console.log(`Team 1: ${team1_name} w/ url: ${team1_url}`);
        console.log(`Team 1: ${team1_name} w/ url: ${team1_url} and img: ${team1_img}`);
        // console.log(`Team 2: ${team2_name} w/ url: ${team2_url}`);
        console.log(`Team 2: ${team2_name} w/ url: ${team2_url} and img: ${team2_img}`);

        const team1Badge = document.getElementById('team1-counter-img');
            if (team1Badge && team1_img) {
                team1Badge.src = team1_img.startsWith('data:image/') 
                ? team1_img
                : `data:image/png;base64,${team1_img}`;
            }

        const team2Badge = document.getElementById('team2-counter-img');
            if (team2Badge && team2_img) {
                team2Badge.src = team2_img.startsWith('data:image/') 
                ? team2_img
                : `data:image/png;base64,${team2_img}`;
            }
    })
    .catch(error => {
        console.error('Error fetching initial scrape data:', error);

    });  

    

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
    select_player(GKS, "GK", 'gk')
});

document.getElementById('select-rb-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'rb')   
});

document.getElementById('select-cb1-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'cb1')   
});

document.getElementById('select-cb2-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'cb2')   
});

document.getElementById('select-lb-btn').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'lb')   
});

document.getElementById('select-cdm-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cdm')   
});

document.getElementById('select-cm-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cm')   
});

document.getElementById('select-cam-btn').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cam')   
});

document.getElementById('select-lw-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'lw');
});

document.getElementById('select-rw-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'rw')   
});

document.getElementById('select-st-btn').addEventListener('click', () => {
    select_player(FORS, "FOR", 'st')   
});


function select_player(pos_list, target_pos_str, pos_id) {
    
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
        console.log(`HELLO: selected-${pos_id}`)
        const selectedPlayer = document.getElementById(`selected-${pos_id}`);
        selectedPlayer.textContent = select.value;
        const matchedItem = pos_list.find(item => item.player_name === select.value);
        console.log(matchedItem);

        const selectedPlayerImg = document.getElementById(`selected-${pos_id}-img`);
        if (selectedPlayerImg && matchedItem.img) {
            selectedPlayerImg.src = matchedItem.img.startsWith('data:image/') 
            ? matchedItem.img 
            : `data:image/png;base64,${matchedItem.img}`;
        }

        console.log(`team-selected-${pos_id}-img`)
        const selectedPlayerTeamImg = document.getElementById(`team-selected-${pos_id}-img`);
        console.log(matchedItem.team_name);
        
        if (matchedItem.team_name === team1_name) {
            console.log(team1_name)
            if (selectedPlayerTeamImg && team1_img) {
                selectedPlayerTeamImg.src = team1_img.startsWith('data:image/') 
                ? team1_img
                : `data:image/png;base64,${team1_img}`;
                selected_team[`${pos_id}`] = 1;
            }
        } 
        if (matchedItem.team_name === team2_name) {
            console.log(team2_name)
            if (selectedPlayerTeamImg && team2_img) {
                selectedPlayerTeamImg.src = team2_img.startsWith('data:image/') 
                ? team2_img
                : `data:image/png;base64,${team2_img}`;
                selected_team[`${pos_id}`] = -1;
            }
        } 

        let t1_count = 0;
        let t2_count = 0;
        Object.entries(selected_team).forEach(([position, data]) => {
            console.log(`Position: ${position}, Data: ${data}`);
            if (data === 1) {
                t1_count = t1_count + 1;
            }
            if (data === -1) {
                t2_count = t2_count + 1;
            }
        });
        const team1Count = document.getElementById('team1-counter-value');
        team1Count.value = t1_count;
        team1Count.textContent = t1_count;

        const team2Count = document.getElementById('team2-counter-value');
        team2Count.value = t2_count;
        team2Count.textContent = t2_count;

    });
}