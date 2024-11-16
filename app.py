from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup

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
def button_scrape(query):
    url = query
    if not url:
        print("error: No URL provided")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    text_data = [item.text for item in soup.find_all("td", class_=["text-left"])]
    # Pair names and positions
    players = []
    for i in range(0, len(text_data), 2):  # Iterate two elements at a time
        name = text_data[i]
        position = text_data[i + 1] if i + 1 < len(text_data) else None
        players.append({"name": name, "position": position})
    return players

# Flask API endpoint for initial scrape
@app.route('/initial_scrape')
def initial_scrape_endpoint():
    data = initial_scrape()
    return jsonify(data)

# Function for button-triggered scrape
@app.route('/button_scrape', methods=['POST'])
def button_scrape_endpoint():
    query = request.json.get('query')
    data = button_scrape(query)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
