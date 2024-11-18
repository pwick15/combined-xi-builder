from flask import Flask, render_template, jsonify, request, session
import requests
from bs4 import BeautifulSoup
from team import *
from player import *
import os
import base64

''' 
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
    return render_template('index.html')

def initial_scrape():
    url = "https://en.soccerwiki.org/squad.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = []
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
                    text = link.text.strip()
                    row_data['text'] = text
                    row_data['url'] = href

            # Image
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

    return data


# Function for button-triggered scrape
def button_scrape(team1_name, team1_url, team2_name, team2_url):
    global team
    team1_url = BASE_URL + team1_url
    team2_url = BASE_URL + team2_url
    print(f'team1_url: {team1_url}')
    print(f'team2_url: {team2_url}')
    if not team1_url:
        print("error: No URL provided for Team 1")
    if not team2_url:
        print("error: No URL provided for Team 2")
    response1 = requests.get(team1_url)
    response2 = requests.get(team2_url)
    soup1 = BeautifulSoup(response1.text, 'html.parser')
    text_data1 = [item.text for item in soup1.find_all("td", class_=["text-left"])]
    soup2 = BeautifulSoup(response2.text, 'html.parser')
    text_data2 = [item.text for item in soup2.find_all("td", class_=["text-left"])]
    
    # Pair names and positions
    team1 = Team(team1_name)
    team2 = Team(team2_name)
    print(f'B len team1: {len(team1)}')
    print(f'B len team2: {len(team2)}')
    players = []
    # print(text_data)
    for i in range(0, len(text_data1), 2):  # Iterate two elements at a time
        name = text_data1[i]
        position = text_data1[i + 1] if i + 1 < len(text_data1) else None
        print(name, position)
        if position is not None:
            player = Player.create_player(name, team1_name, position.split(","))
            # Player.print_player(player)
            if player is not None: 
                # print(player.name)
                # print(player.position)
                players.append({"name": player.name, "position": player.position})
                team1.add_player_to_team(player)

    for i in range(0, len(text_data2), 2):  # Iterate two elements at a time
        name = text_data2[i]
        position = text_data2[i + 1] if i + 1 < len(text_data2) else None
        print(name, position)
        if position is not None:
            player = Player.create_player(name, team2_name, position.split(","))
            # Player.print_player(player)
            if player is not None: 
                # print(player.name)
                # print(player.position)
                players.append({"name": player.name, "position": player.position})
                team2.add_player_to_team(player)
    
    print(f'A len team1: {len(team1)}')
    print(f'A len team2: {len(team2)}')

    session['team1'] = team1_name
    session['team2'] = team2_name
    session['team1_players'] = [player.__dict__ for player in team1.players]  # Serialize players
    session['team2_players'] = [player.__dict__ for player in team2.players]

    # print(len(team1))
    return players

# Flask API endpoint for initial scrape
@app.route('/initial_scrape')
def initial_scrape_endpoint():
    data = initial_scrape()
    return jsonify(data)

# Function for button-triggered scrape
@app.route('/button_scrape', methods=['POST'])
def button_scrape_endpoint():
    team1_name = request.json.get('team1_name')
    team1_url = request.json.get('team1_url')
    team2_name = request.json.get('team2_name')
    team2_url = request.json.get('team2_url')
    data = button_scrape(team1_name, team1_url, team2_name, team2_url)
    return jsonify(data)

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
