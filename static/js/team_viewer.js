
class CombinedXIViewer {
    constructor() {
        this.messages = [
            "Warming up...",
            "Analyzing heatmaps…",
            "Analyzing heatmaps…",
            "Finalizing the lineup...",
            "Running a fitness test...",
            "Kick-off imminent..."
        ];

        this.messageIndex = 0;
        this.messageInterval = null;
        this.bothTeams = [];
        this.positionGroups = { GK: [], DEF: [], MID: [], FOR: [] };
        this.teamInfo = { 
            team1Name: null,
            team2Name: null,
            team1Image: null, 
            team2Image: null };
        this.selectedTeam = {
            gk: 0, lb: 0, cb1: 0, cb2: 0, rb: 0,
            cdm: 0, cm: 0, cam: 0, lw: 0, rw: 0, st: 0
        };

        this.init();
    }

    init() {
        this.setupLoadingScreen();
        console.log("setting up loading screen");
        
        this.fetchTeamData();
        console.log("fetching team data");
        
        this.addPlayerSelectionListeners();
        console.log("adding plauer selection listeners")
    }

    setupLoadingScreen() {
        const messageElement = document.getElementById("loading-message");
        this.messageInterval = setInterval(() => {
            messageElement.textContent = this.messages[this.messageIndex];
            this.messageIndex = (this.messageIndex + 1) % this.messages.length;
        }, 3000);

        document.getElementById("loading-page").style.display = "flex";
        document.getElementById("content-container").style.display = "none";
    }

    stopLoadingScreen() {
        document.getElementById("loading-page").style.display = "none";
        document.getElementById("content-container").style.display = "block";
        clearInterval(this.messageInterval);
    }

    async fetchTeamData() {
        const queryParams = this.getQueryParams();
        
        try {
            await Promise.all([
                this.fetchTeamBadges(queryParams),
                this.fetchPlayerData(queryParams)
            ]);
            
            this.stopLoadingScreen(); // This runs only after both functions complete
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    

    getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            team1Name: urlParams.get("team1_name"),
            team2Name: urlParams.get("team2_name"),
            team1Url: urlParams.get("team1_url"),
            team2Url: urlParams.get("team2_url")
        };
    }

    async fetchTeamBadges({ team1Name, team2Name, team1Url, team2Url }) {
        try {
            const response = await fetch("/get_chosen_team_badges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ team1_url: team1Url, team2_url: team2Url })
            });
            const data = await response.json();

            this.teamInfo.team1Image = data[0].img;
            this.teamInfo.team2Image = data[1].img;
            this.teamInfo.team1Name = team1Name;
            this.teamInfo.team2Name = team2Name;
            this.updateTeamBadge("team1-counter-img", this.teamInfo.team1Image);
            this.updateTeamBadge("team2-counter-img", this.teamInfo.team2Image);
        } catch (error) {
            console.error("Error fetching team badges:", error);
        }
    }

    updateTeamBadge(elementId, img) {
        const badge = document.getElementById(elementId);
        if (badge && img) {
            badge.src = img.startsWith("data:image/") ? img : `data:image/png;base64,${img}`;
        }
    }

    async fetchPlayerData({ team1Name, team1Url, team2Name, team2Url }) {
        try {
            const response = await fetch("/button_scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ team1_name: team1Name, team1_url: team1Url, team2_name: team2Name, team2_url: team2Url })
            });
            const data = await response.json();
            this.bothTeams = data.both_teams;
            console.log("successfully retrived all player data")
            console.log(this.bothTeams)
        } catch (error) {
            console.error("Error fetching player data:", error);
        }
    }

    addPlayerSelectionListeners() {
        const positions = [
            { id: "gk", posGroup: "GK"},
            { id: "rb", posGroup: "DEF"},
            { id: "cb1", posGroup: "DEF"},
            { id: "cb2", posGroup: "DEF"},
            { id: "lb", posGroup: "DEF"},
            { id: "cdm", posGroup: "MID"},
            { id: "cm", posGroup: "MID"},
            { id: "cam", posGroup: "MID"},
            { id: "lw", posGroup: "FOR"},
            { id: "rw", posGroup: "FOR"},
            { id: "st", posGroup: "FOR"}
        ];

        positions.forEach(({ id, posGroup}) => {
            document.getElementById(`${id}-card`).addEventListener("click", () => {
                console.log(this.positionGroups[posGroup]);
                this.selectPlayer(this.positionGroups[posGroup], posGroup, id)
            });
        });
    }

    selectPlayer(posList, posKey, posID) {
        if (posList.length === 0) {
            console.log("no players currently stored for position group");
            
            this.bothTeams.forEach(player => {
                if (player.position === posKey.toUpperCase()) {
                    console.log("Found player!");
                    posList.push(player);
                }
            });
            console.log("attempted to add plauers into position group");
            console.log(posList);
        }

        const container = document.getElementById("popup-player-options");
        container.innerHTML = ""; // Clear previous selections

        posList.forEach(player => {
            const card = this.createPlayerCard(player, posID);
            container.appendChild(card);
        });

        const closeBtn = document.getElementById("close-btn");
        closeBtn.addEventListener("click", () => this.closePopup());

        this.showPopup();
    }

    createPlayerCard(player, posID) {
        const card = document.createElement("div");
        card.className = "fifa-card";

        // Player image
        const playerImg = document.createElement("img");
        playerImg.src = player.img.startsWith("data:image/")
            ? player.img
            : `data:image/png;base64,${player.img}`;
        playerImg.alt = "Player Image";
        playerImg.className = "player-image";
        card.appendChild(playerImg);

        // Separator
        card.appendChild(this.createElement("div", "card-separator"));

        // Player name
        const playerName = this.createElement("p", "player-name", player.player_name);
        playerName.id = `options-${posID}`;
        card.appendChild(playerName);

        // Team badge
        const badgeWrapper = this.createElement("div", "team-badge-wrapper");
        const teamImg = document.createElement("img");
        teamImg.src = this.getTeamImage(player.team_name);
        console.log("Finished getting team badge")
        teamImg.alt = "Team Badge";
        teamImg.className = "player-team-image";
        badgeWrapper.appendChild(teamImg);
        card.appendChild(badgeWrapper);
        
        card.addEventListener("click", () => this.confirmPlayerSelection(player, posID));
        return card;
    }

    getTeamImage(teamName) {
        console.log("attempting to get team image!")
        console.log(teamName);
        console.log(this.teamInfo);

        if (teamName === this.teamInfo.team1Name) return this.formatImageString(this.teamInfo.team1Image);
        if (teamName === this.teamInfo.team2Name) return this.formatImageString(this.teamInfo.team2Image);

        return "../static/assets/soccer-ball.png";
    }

    formatImageString(img) {
        return img.startsWith("data:image/") ? img : `data:image/png;base64,${img}`;
    }

    showPopup() {
        document.body.classList.add("popup-active");
    }

    closePopup() {
        document.body.classList.remove("popup-active");
    }

    confirmPlayerSelection(player, posID) {
        const playerNameElement = document.getElementById(`selected-${posID}`);
        const playerImgElement = document.getElementById(`selected-${posID}-img`);
        const teamImgElement = document.getElementById(`team-selected-${posID}-img`);

        if (playerNameElement) playerNameElement.textContent = player.player_name;
        if (playerImgElement) {
            playerImgElement.src = player.img.startsWith("data:image/")
                ? player.img
                : `data:image/png;base64,${player.img}`;
        }
        if (teamImgElement) {
            teamImgElement.src = this.getTeamImage(player.team_name);
            teamImgElement.style.display = "block";  // Corrected line
        }

        this.updateTeamSelection(player.team_name, posID);
        this.closePopup();
    }

    updateTeamSelection(teamName, posID) {
        
        this.selectedTeam[posID] = teamName === this.teamInfo.team1Name ? 1 : -1;
        console.log(this.selectedTeam);

        const team1Count = Object.values(this.selectedTeam).filter(v => v === 1).length;
        const team2Count = Object.values(this.selectedTeam).filter(v => v === -1).length;

        document.getElementById("team1-counter-value").textContent = team1Count;
        document.getElementById("team2-counter-value").textContent = team2Count;
    }

    createElement(tag, className, textContent = "") {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = textContent;
        return element;
    }
}

// Instantiate the class
new CombinedXIViewer();
