from flask import Flask, render_template, jsonify, request, session
import requests
from bs4 import BeautifulSoup
from team import *
from player import *
import os
import base64

''' TODO LIST
TODO change website for better scalability.
Use: https://www.playmakerstats.com/competition/la-liga
Limit the scope to the top 5 leagues.
TODO save the scraped data locally to improve efficiency (avoid repeatedly downloading images)
'''


BASE_URL = "https://en.soccerwiki.org/"
team1 = None
team2 = None
app = Flask(__name__)
app.secret_key = os.urandom(24)


# Serve the HTML frontend
@app.route('/')
def index():
    return render_template('index.html')

# Given a team name and url, request relevant data and create a Team object 
def create_team(team_name,url):
    team = Team(team_name)
    url = BASE_URL + url
    if not url:
        print("error: No URL provided for Team 1")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    text_data = [item.text for item in soup.find_all("td", class_=["text-left"])]
    for i in range(0, len(text_data), 2):  # Iterate two elements at a time
        player_name = text_data[i]
        position = text_data[i + 1] if i + 1 < len(text_data) else None
        if position is not None:
            player = Player.create_player(player_name, team_name, position.split(","))
            if player is not None: 
                team.add_player_to_team(player)
    team.view_team()
    return team
    
# Persist data for global access 
def persist_team_data(id, team):
    session[f'team{id}'] = team.name
    session[f'team{id}_players'] = [player.__dict__ for player in team.players]   

# Flask API endpoint for initial scrape
@app.route('/initial_scrape')
def initial_scrape_endpoint():
    url = "https://en.soccerwiki.org/squad.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = []
    # TODO exclude loan players
    tbody = soup.find('tbody')  # Find the tbody tag
    if tbody:  # Check if tbody exists
        rows = tbody.find_all('tr')  # Find all tr tags within tbody
        for row in rows:
            row_data = {}

            # Text and URL
            cell = row.find('td', class_='text-left')  # Find td with class 'text-left'
            if cell:
                link = cell.find('a')  # Find the a tag within the td
                if link:
                    href = link['href']
                    team_name = link.text.strip()
                    row_data['team_name'] = team_name
                    row_data['url'] = href

            # Image TODO uncomment to get images back
            img_tag = row.find('img', class_='lozad img-fluid img-thumbnail')
            if img_tag:
                img_url = img_tag.get('data-src', img_tag.get('src'))  # Handle lozad
                if img_url:
                    try:
                        img_response = requests.get(img_url)
                        img_response.raise_for_status()
                        img_data = img_response.content
                        # Encode image as Base64
                        encoded_img = base64.b64encode(img_data).decode('utf-8')
                        row_data['img'] = encoded_img
                    except requests.RequestException as e:
                        print(f"Failed to download image {img_url}: {e}")
                        row_data['img'] = None
            
            if row_data:
                data.append(row_data)

    return jsonify(data)

# Function for button-triggered scrape
@app.route('/button_scrape', methods=['POST'])
def button_scrape_endpoint():
    team1_name, team1_url, team2_name, team2_url = (
        request.json.get(key) for key in ['team1_name', 'team1_url', 'team2_name', 'team2_url'])
    team1 = create_team(team1_name, team1_url)
    persist_team_data("1", team1)
    team2 = create_team(team2_name, team2_url)
    persist_team_data("2", team2)
    return jsonify({})

@app.route('/select_gk')
def select_gk():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    gks = [{"name": player['name'], "team": player['team']} for player in all_players if "GK" in player['position']]
    return jsonify(gks)

@app.route('/select_def')
def select_def():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    defs = [{"name": player['name'], "team": player['team']} for player in all_players if "DEF" in player['position']]
    return jsonify(defs) 

@app.route('/select_mid')
def select_mid():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    mids = [{"name": player['name'], "team": player['team']} for player in all_players if "MID" in player['position']]
    return jsonify(mids) 

@app.route('/select_for')
def select_for():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    fors = [{"name": player['name'], "team": player['team']} for player in all_players if "FOR" in player['position']]
    return jsonify(fors) 

# TODO add a fetch API callback to handle updating team lists when a player is chosen. Add attribute to players like 'Chosen', and set it 

# @app.route('/team_view')
# def team_view():
#     # Pass query parameters to the template if needed
#     team1 = request.args.get('team1')
#     team2 = request.args.get('team2')
#     return render_template('team_view.html', team1=team1, team2=team2)

@app.route('/team_view')
def team_view():
    # Get 'team1' and 'team2' from the query parameters
    team1_name = request.args.get('team1_name')
    team2_name = request.args.get('team2_name')
    team1_url = request.args.get('team1_url')
    team2_url = request.args.get('team2_url')
    print(team1_name, team1_url)
    print(team2_name, team2_url)
    return render_template('team_view.html', team1_name=team1_name, team2_name=team2_name, team1_url=team1_url, team2_url=team2_url)

if __name__ == '__main__':
    app.run(debug=True)
