class TeamSelector {
    constructor() {
        this.items = [];
        this.selectedTeams = [
            { name: null, url: null, img: null },
            { name: null, url: null, img: null }
        ];
    }

    // Fetch initial data and configure Fuse.js
    initialize() {
        this.fetchInitialData().then(() => this.configureFuseJS());
        this.addEventListeners();
    }

    async fetchInitialData() {
        try {
            const response = await fetch('/initial_scrape');
            const data = await response.json();
            this.items = data.map(item => ({
                name: item.team_name,
                url: item.url,
                img: item.img
            }));
        } catch (error) {
            console.error('Error fetching initial scrape data:', error);
        }
    }

    selectTeam(name, id) {
        const matchedItem = this.items.find(item => item.name === name);
        if (matchedItem) {
            this.selectedTeams[id - 1] = { ...matchedItem };
            const teamNameEl = document.getElementById(`team${id}-name`);
            teamNameEl.value = name;
            teamNameEl.textContent = name;
            teamNameEl.classList.add('grow');

            const teamImgEl = document.getElementById(`team${id}-img`);
            if (teamImgEl) {
                teamImgEl.src = matchedItem.img.startsWith('data:image/')
                    ? matchedItem.img
                    : `data:image/png;base64,${matchedItem.img}`;
                // Trigger the grow animation
                teamImgEl.classList.add('grow');
            }

            // Highlight fetch button when both teams are selected
            if (this.selectedTeams[0].name && this.selectedTeams[1].name) {
                document.getElementById('fetch-lineups-btn').style.backgroundColor = 'orange';
            }
        } else {
            console.log('No match found.');
        }
    }

    configureFuseJS() {
        const fuse = new Fuse(this.items, {
            keys: ['name'],
            threshold: 0.1
        });

        const searchBar = document.getElementById('search-bar');
        const gridContainer = document.getElementById('results-grid');

        // Populate grid with all items
        this.populateGrid(gridContainer, this.items);

        searchBar.addEventListener('input', () => {
            const query = searchBar.value;
            const results = fuse.search(query).map(result => result.item);
            gridContainer.innerHTML = '';
            this.populateGrid(gridContainer, query.length === 0 ? this.items : results);
        });
    }

    populateGrid(container, items) {
        items.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.id = `${item.name}-grid-item`;

            const img = document.createElement('img');
            img.src = item.img.startsWith('data:image/')
                ? item.img
                : `data:image/png;base64,${item.img}`;
            img.alt = `${item.name}-icon`;

            const text = document.createElement('span');
            text.textContent = item.name;

            gridItem.appendChild(img);
            gridItem.appendChild(text);

            gridItem.addEventListener('click', () => {
                if (!this.selectedTeams[0].name) {
                    this.selectTeam(item.name, 1);
                } else if (!this.selectedTeams[1].name) {
                    this.selectTeam(item.name, 2);
                }
            });

            container.appendChild(gridItem);
        });
    }

    resetSelection() {
        this.selectedTeams = [
            { name: null, url: null, img: null },
            { name: null, url: null, img: null }
        ];

        ['team1', 'team2'].forEach(team => {
            const teamNameEl = document.getElementById(`${team}-name`);
            teamNameEl.value = '';
            teamNameEl.textContent = '';
            teamNameEl.classList.remove('grow');

            const teamImgEl = document.getElementById(`${team}-img`);
            if (teamImgEl) {
                teamImgEl.src = '/static/assets/soccer-jersey.png';
                teamImgEl.classList.remove('grow');
            }
        });

        document.getElementById('fetch-lineups-btn').style.backgroundColor = '#AAAAAA';
    }

    navigateToLineups() {
        if (this.selectedTeams[0].name && this.selectedTeams[1].name) {
            const team1 = this.selectedTeams[0];
            const team2 = this.selectedTeams[1];
            window.location.href = `/team_view?team1_name=${encodeURIComponent(team1.name)}&team2_name=${encodeURIComponent(team2.name)}&team1_url=${encodeURIComponent(team1.url)}&team2_url=${encodeURIComponent(team2.url)}`;
        }
    }

    addEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSelection());
        document.getElementById('fetch-lineups-btn').addEventListener('click', () => this.navigateToLineups());
    }
}

// Instantiate and initialize the TeamSelector class
const teamSelector = new TeamSelector();
teamSelector.initialize();
