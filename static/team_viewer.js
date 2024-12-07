/* TODO: 
- Add testing code
- Refactor with design patterns
- Utilise database for storage of data
*/
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

// pop up for player selection
function showPopup() {
    document.body.classList.add("popup-active");
}
  
function closePopup() {
    document.body.classList.remove("popup-active");
}

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
    

document.getElementById('gk-card').addEventListener('click', () => {
    select_player(GKS, "GK", 'gk')
});

document.getElementById('rb-card').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'rb')   
});

document.getElementById('cb1-card').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'cb1')   
});

document.getElementById('cb2-card').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'cb2')   
});

document.getElementById('lb-card').addEventListener('click', () => {
    select_player(DEFS, "DEF", 'lb')   
});

document.getElementById('cdm-card').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cdm')   
});

document.getElementById('cm-card').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cm')   
});

document.getElementById('cam-card').addEventListener('click', () => {
    select_player(MIDS, "MID", 'cam')   
});

document.getElementById('lw-card').addEventListener('click', () => {
    select_player(FORS, "FOR", 'lw');
});

document.getElementById('rw-card').addEventListener('click', () => {
    select_player(FORS, "FOR", 'rw')   
});

document.getElementById('st-card').addEventListener('click', () => {
    select_player(FORS, "FOR", 'st')   
});


function select_player(pos_list, target_pos_str, pos_id) {
    
    // Dynamically create a new select element for GK selection
    
    if (pos_list.length === 0) {
        both_teams.forEach(player => {
            if (player.position === target_pos_str) {
                pos_list.push(player);
            }
        })
        console.log("Extracted players from position group");
    }
    console.log(pos_list);

    // Append to the body or a container
    const container = document.getElementById('popup-player-options');
    container.innerHTML = ''; // Clear previous selections

    pos_list.forEach(player => {
        console.log(player)
        // Create the fifa-card container
        const card = document.createElement('div');
        card.className = 'fifa-card';

        // Add player image
        const playerImg = document.createElement('img');
        playerImg.src = player.img.startsWith('data:image/') 
            ? player.img
            : `data:image/png;base64,${player.img}`;
        playerImg.alt = 'Player Image';
        playerImg.className = 'player-image';
        card.appendChild(playerImg);

        // Add card separator
        const separator = document.createElement('div');
        separator.className = 'card-separator';
        card.appendChild(separator);

        // Add player name
        const playerName = document.createElement('p');
        playerName.className = 'player-name';
        playerName.id = `options-${pos_id}`;
        playerName.textContent = player.player_name;
        card.appendChild(playerName);

        // Add team badge wrapper
        const badgeWrapper = document.createElement('div');
        badgeWrapper.className = 'team-badge-wrapper';


        const teamImg = document.createElement('img');
        let chosen_img = null;
        if (player.team_name === team1_name) {
            chosen_img = team1_img; 
        }
        else if (player.team_name === team2_name) {
            chosen_img = team2_img;
        }
        else { 
            chosen_img = '../static/assets/soccer-ball.png';
        }

        teamImg.src = chosen_img.startsWith('data:image/') 
            ? chosen_img
            : `data:image/png;base64,${chosen_img}`;

        teamImg.alt = 'Team Badge';
        teamImg.className = 'player-team-image';
        badgeWrapper.appendChild(teamImg);
        card.appendChild(badgeWrapper);

        // Append the card to the container
        container.appendChild(card);
    });

    showPopup();


    // Get all top-level div elements (direct children of the container)
    const cards = Array.from(container.children).filter(child => child.tagName === 'DIV');

    // Loop through each top-level div
    cards.forEach(card => {
        // Add event listener or perform other actions
        card.addEventListener('click', () => {
            console.log(`HELLO: selected-${pos_id}`)
            const selectedPlayer = document.getElementById(`selected-${pos_id}`);

            // Get the player name element (assuming it's inside the clicked card)
            const chosenPlayerElement = card.querySelector(`#options-${pos_id}`);
                    
            // Ensure the element exists before accessing its content
            let chosenPlayerName = '';
            if (chosenPlayerElement) {
                chosenPlayerName = chosenPlayerElement.textContent; // Get the player's name
            } else {
                console.warn(`Element with ID 'selected-${pos_id}' not found inside the card.`);
            }
            console.log(chosenPlayerName);

            const matchedItem = pos_list.find(item => item.player_name === chosenPlayerName);
            console.log(matchedItem);
    
            // Add player name
            const playerName = document.getElementById(`selected-${pos_id}`);
            playerName.textContent = chosenPlayerName;
            console.log(playerName.textContent);


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
                    console.log('t1_img')
                    selectedPlayerTeamImg.src = team1_img.startsWith('data:image/') 
                    ? team1_img
                    : `data:image/png;base64,${team1_img}`;
                    selected_team[`${pos_id}`] = 1;
                }
            } 
            if (matchedItem.team_name === team2_name) {
                console.log(team2_name)
                if (selectedPlayerTeamImg && team2_img) {
                    console.log('t2_img')
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
    
            closePopup();
        });
    });
    
}