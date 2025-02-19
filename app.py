from flask import Flask, render_template, jsonify, request, session
import requests
from bs4 import BeautifulSoup
from core.team import *
from core.player import *
import os
import base64
from utils.data_manager import *

''' TODO LIST
TODO: Add animations 
TODO: Split the pop up window into 2 sections. Team 1 side and Team 2 side
TODO change website for better scalability.
Use: https://www.playmakerstats.com/competition/la-liga
Limit the scope to the top 5 leagues.
'''

BASE_URL = "https://en.soccerwiki.org/"
team1 = None
team2 = None
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Serve the HTML frontend
@app.route('/')
def index():
    return render_template('homepage.html')


# Given a team name and url, request relevant data and create a Team object 
def create_team(team_name,url):
    url = BASE_URL + url
    if not url:
        print("error: No URL provided for Team 1")
    
    cached_data = load_player_data()  # Load the cached CSV data
    team_json = []
    team = Team(team_name)
    new_data_count = 0

    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    table = soup.find('table', id='datatable')
    if table:
        tbody = table.find('tbody')
        if tbody:
            rows = tbody.find_all('tr')
            for row in rows:
                row_data = {}

                # scrape key data
                cols = row.find_all('td')
                shirt_num = cols[0].text.strip()
                player_name = cols[3].text.strip()
                position = cols[4].text.strip()

                # Fetch the image if not already in the cache
                if player_name in cached_data and cached_data[player_name]['img']:
                    print("FOUND PLAYER IN CACHE")
                    encoded_img = cached_data[player_name]['img']
                else:
                    print("FETCHING PLAYER DATA")
                    # UNCOMMENT BELOW TO STORE IMAGES
                    img_tag = row.find('img', class_='lozad img-fluid img-thumbnail')
                    if img_tag:
                        img_url = img_tag.get('data-src', img_tag.get('src'))
                        if img_url:
                            img_response = requests.get(img_url)
                            img_response.raise_for_status()
                            img_data = img_response.content
                            # Encode image as Base64
                            encoded_img = base64.b64encode(img_data).decode('utf-8')
                player = Player.create_player(player_name, team_name, position.split(","))
                if player is not None:
                    row_data['player_name'] = player_name
                    row_data['team_name'] = team_name
                    row_data['img'] = encoded_img #UNCOMMENT
                    row_data['position'] = player.position
                    if row_data:
                        # Save new data to cache
                        cached_data[player_name] = {
                            'player_name': player_name,
                            'team_name': team_name,
                            'img': encoded_img,
                            'position': position
                        }
                        new_data_count += 1
                        team_json.append(row_data)     
                        team.add_player_to_team(player)
                    else: 
                        print('player not added, row_data is None type or empty')
    team.view_team()
    if new_data_count > 0:
        save_player_data(cached_data.values())
    return team, team_json

    

# Flask API endpoint for initial scrape
@app.route('/initial_scrape')
def initial_scrape_endpoint():
    url = "https://en.soccerwiki.org/squad.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    cached_data = load_team_data()  # Load the cached CSV data
    new_data = []

    tbody = soup.find('tbody')  # Find the tbody tag
    if tbody:
        rows = tbody.find_all('tr')  # Find all tr tags within tbody
        count = 0
        for row in rows:
            row_data = {}

            # Scrape Team Name and URL
            cell = row.find('td', class_='text-left')
            if cell:
                link = cell.find('a')
                if link:
                    team_name = link.text.strip()
                    href = link['href']

                    # Check if this team already exists in the cache
                    if team_name in cached_data and cached_data[team_name]['url'] == href:
                        print("TEAM EXISTS IN CACHE")
                        count += 1
                        row_data['team_name'] = team_name
                        row_data['url'] = href
                        row_data['img'] = cached_data[team_name]['img']  # Use cached image
                    else:
                        # Fetch the image if not already in the cache
                        print("FETCHING TEAM DATA")
                        img_tag = row.find('img', class_='lozad img-fluid img-thumbnail')
                        if img_tag:
                            img_url = img_tag.get('data-src', img_tag.get('src'))
                            if img_url:
                                try:
                                    img_response = requests.get(img_url)
                                    img_response.raise_for_status()
                                    img_data = img_response.content
                                    # Encode image as Base64
                                    encoded_img = base64.b64encode(img_data).decode('utf-8')
                                    row_data['team_name'] = team_name
                                    row_data['url'] = href
                                    row_data['img'] = encoded_img

                                    # Save new data to cache
                                    cached_data[team_name] = {
                                        'team_name': team_name,
                                        'url': href,
                                        'img': encoded_img
                                    }
                                except requests.RequestException as e:
                                    print(f"Failed to download image {img_url}: {e}")
                                    row_data['img'] = None
            if row_data:
                new_data.append(row_data)
        print(count)
    # Save updated cache to CSV
    save_team_data(cached_data.values())
    return jsonify(new_data)


# Flask API endpoint for initial scrape
@app.route('/get_chosen_team_badges', methods=['POST'])
def get_chosen_team_badges_endpoint():
    team1_url, team2_url = (
        request.json.get(key) for key in ['team1_url', 'team2_url'])
    urls = [BASE_URL + team1_url, BASE_URL + team2_url]
    new_data = []

    for url in urls:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        row30 = soup.find(class_ = 'row-30')  # Find the tbody tag
        row_data = {}
        if row30:
            img_container = row30.find(class_ = 'player-img')  # Find all tr tags within tbody
            if img_container:
                img_tag = img_container.find('img', class_='lozad img-fluid img-thumbnail')
                if img_tag:
                    img_url = img_tag.get('data-src', img_tag.get('src'))
                    if img_url:
                        try:
                            img_response = requests.get(img_url)
                            img_response.raise_for_status()
                            img_data = img_response.content
                            # Encode image as Base64
                            encoded_img = base64.b64encode(img_data).decode('utf-8')
                        except requests.RequestException as e:
                            print(f"Failed to download image {img_url}: {e}")
                            encoded_img = None
                        row_data['img'] = encoded_img
        if row_data:
            new_data.append(row_data)
    return jsonify(new_data)

# Function for button-triggered scrape
@app.route('/button_scrape', methods=['POST'])
def button_scrape_endpoint():
    team1_name, team1_url, team2_name, team2_url = (
        request.json.get(key) for key in ['team1_name', 'team1_url', 'team2_name', 'team2_url'])
    team1, team1_json = create_team(team1_name, team1_url)
    persist_team_data("1", team1)
    team2, team2_json = create_team(team2_name, team2_url)
    persist_team_data("2", team2)
    both_teams_json = team1_json + team2_json
    print(len(team1_json), len(team2_json))
    return jsonify({"both_teams": both_teams_json})

@app.route('/select_gk')
def select_gk():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    gks = [{"name": player['player_name'], "team": player['team_name']} for player in all_players if "GK" in player['position']]
    return jsonify(gks)

@app.route('/select_def')
def select_def():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    defs = [{"name": player['player_name'], "team": player['team_name']} for player in all_players if "DEF" in player['position']]
    return jsonify(defs) 

@app.route('/select_mid')
def select_mid():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    mids = [{"name": player['player_name'], "team": player['team_name']} for player in all_players if "MID" in player['position']]
    return jsonify(mids) 

@app.route('/select_for')
def select_for():
    global team1, team2
        # Retrieve from session
    team1_players = session.get('team1_players', [])
    team2_players = session.get('team2_players', [])
    all_players = team1_players + team2_players

    fors = [{"name": player['player_name'], "team": player['team_name']} for player in all_players if "FOR" in player['position']]
    return jsonify(fors) 

# TODO add a fetch API callback to handle updating team lists when a player is chosen. Add attribute to players like 'Chosen', and set it 

# @app.route('/team_view')
# def team_view():
#     # Pass query parameters to the template if needed
#     team1 = request.args.get('team1')
#     team2 = request.args.get('team2')
#     return render_template('team_viewer.html', team1=team1, team2=team2)

@app.route('/team_view')
def team_view():
    # Get 'team1' and 'team2' from the query parameters
    team1_name = request.args.get('team1_name')
    team2_name = request.args.get('team2_name')
    team1_url = request.args.get('team1_url')
    team2_url = request.args.get('team2_url')
    return render_template('team_viewer.html', team1_name=team1_name, team2_name=team2_name, team1_url=team1_url, team2_url=team2_url)

if __name__ == '__main__':
    app.run(debug=True)
