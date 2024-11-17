from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
from team import *
from player import *

''' 
TODO change website for better scalability.
Use: https://www.playmakerstats.com/competition/la-liga
Limit the scope to the top 5 leagues.
'''
BASE_URL = "https://en.soccerwiki.org/"

app = Flask(__name__)

# Serve the HTML frontend
@app.route('/')
def index():
    return render_template('index.html')


# Function for initial scrape
def initial_scrape():
    url = "https://en.soccerwiki.org/squad.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Access elements within tbody -> tr -> td -> a
    data = []
    tbody = soup.find('tbody')  # Find the tbody tag
    if tbody:  # Check if tbody exists
        rows = tbody.find_all('tr')  # Find all tr tags within tbody
        for row in rows:
            cell = row.find('td', class_='text-left')  # Find td with class 'text-left'
            if cell:
                link = cell.find('a')  # Find the a tag within the td
                if link:
                    href = link['href']  # Get the href attribute
                    text = link.text.strip()  # Get the text inside the a tag
                    data.append({'text': text, 'url': href})  # Save both text and URL
    return data

# Function for button-triggered scrape
def button_scrape(name, url):
    url = BASE_URL + url
    print(f'url: {url}')
    if not url:
        print("error: No URL provided")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    text_data = [item.text for item in soup.find_all("td", class_=["text-left"])]
    # Pair names and positions
    team = Team(name)
    players = []
    # print(text_data)
    for i in range(0, len(text_data), 2):  # Iterate two elements at a time
        name = text_data[i]
        position = text_data[i + 1] if i + 1 < len(text_data) else None
        print(name, position)
        if position is not None:
            player = Player.create_player(name,position.split(","))
            # Player.print_player(player)
            if player is not None: 
                print(player.name)
                print(player.position)
                players.append({"name": player.name, "position": player.position})
                team.add_player_to_team(player)
    print(len(team))
    return players

# Flask API endpoint for initial scrape
@app.route('/initial_scrape')
def initial_scrape_endpoint():
    data = initial_scrape()
    return jsonify(data)

# Function for button-triggered scrape
@app.route('/button_scrape', methods=['POST'])
def button_scrape_endpoint():
    name = request.json.get('name')
    url = request.json.get('url')
    data = button_scrape(name,url)
    return jsonify(data)

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
