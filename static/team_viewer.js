let both_teams = [];
let GKS = [];
let DEFS = [];
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
    })
    .catch(error => console.error('Error fetching initial scrape data:', error));         
    

document.getElementById('select-gk-btn').addEventListener('click', () => {
    
        // Dynamically create a new select element for GK selection
        const select = document.createElement('select');
        select.innerHTML = '<option value="" disabled selected>Select a player</option>';

        console.log(GKS);
        both_teams.forEach(player => {
            if (player.position === "Gk") {
                GKS.push(player);
            }
        })
        console.log(GKS);

        GKS.forEach(player => {
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
            const selectedGK = document.getElementById('selected-gk');
            selectedGK.textContent = select.value;
            const matchedItem = GKS.find(item => item.player_name === select.value);
            console.log(matchedItem);


            const selectedGKImg = document.getElementById('selected-gk-img');
            if (selectedGKImg && matchedItem.img) {
                selectedGKImg.src = matchedItem.img.startsWith('data:image/') 
                ? matchedItem.img 
                : `data:image/png;base64,${matchedItem.img}`;
            }
        });
});

// document.getElementById('select-gk-btn').addEventListener('click', () => {
//     fetch('/select_gk')
//         .then(response => response.json())
//         .then(data => {
//             // Dynamically create a new select element for GK selection
//             const select = document.createElement('select');
//             select.innerHTML = '<option value="" disabled selected>Select a player</option>';

//             data.forEach(player => {
//                 const option = document.createElement('option');
//                 option.value = player.name;
//                 option.textContent = `${player.name}, ${player.team}`;
//                 select.appendChild(option);
//             });

//             // Append to the body or a container
//             const container = document.getElementById('select-container');
//             container.innerHTML = ''; // Clear previous selections
//             container.appendChild(select);

//             // Add event listener for selection change
//             select.addEventListener('change', () => {
//                 const selectedGK = document.getElementById('selected-gk');
//                 selectedGK.textContent = select.value;
//             });
//         })
//         .catch(error => console.error('Error fetching data:', error));
// });

document.getElementById('select-rb-btn').addEventListener('click', () => {
    fetch('/select_def')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selectedDEF = document.getElementById('selected-rb');
                selectedDEF.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-cb1-btn').addEventListener('click', () => {
    fetch('/select_def')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selectedDEF = document.getElementById('selected-cb1');
                selectedDEF.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-cb2-btn').addEventListener('click', () => {
    fetch('/select_def')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selectedDEF = document.getElementById('selected-cb2');
                selectedDEF.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-lb-btn').addEventListener('click', () => {
    fetch('/select_def')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selectedDEF = document.getElementById('selected-lb');
                selectedDEF.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-cdm-btn').addEventListener('click', () => {
    fetch('/select_mid')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-cdm');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-cm-btn').addEventListener('click', () => {
    fetch('/select_mid')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-cm');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-cam-btn').addEventListener('click', () => {
    fetch('/select_mid')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-cam');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-lw-btn').addEventListener('click', () => {
    fetch('/select_for')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-lw');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-rw-btn').addEventListener('click', () => {
    fetch('/select_for')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-rw');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.getElementById('select-st-btn').addEventListener('click', () => {
    fetch('/select_for')
        .then(response => response.json())
        .then(data => {
            // Dynamically create a new select element for RB selection
            const select = document.createElement('select');
            select.innerHTML = '<option value="" disabled selected>Select a player</option>';

            data.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name}, ${player.team}`;
                select.appendChild(option);
            });

            // Append to the body or a container
            const container = document.getElementById('select-container');
            container.innerHTML = ''; // Clear previous selections
            container.appendChild(select);

            // Add event listener for selection change
            select.addEventListener('change', () => {
                const selected = document.getElementById('selected-st');
                selected.textContent = select.value;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

