from flask import session
import os
import csv
csv.field_size_limit(1000000)  # 1 MB limit (for example)

TEAM_CSV_FILE = 'data/team_data.csv'
PLAYER_CSV_FILE = 'data/player_data.csv'

def load_team_data():
    """Load existing team data from the CSV file."""
    if not os.path.exists(TEAM_CSV_FILE):
        return {}
    with open(TEAM_CSV_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {row['team_name']: row for row in reader}

def save_team_data(data):
    """Save team data to the CSV file."""
    with open(TEAM_CSV_FILE, mode="w", encoding="utf-8", newline="") as f:
        fieldnames = ['team_name', 'url', 'img']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def load_player_data():
    """Load existing player data from the CSV file."""
    if not os.path.exists(PLAYER_CSV_FILE):
        return {}
    with open(PLAYER_CSV_FILE, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {row['player_name']: row for row in reader}

def save_player_data(data):
    """Save player data to the CSV file."""
    print("PERSISTING PLAYER DATA")
    with open(PLAYER_CSV_FILE, mode="w", encoding="utf-8", newline="") as f:
        fieldnames = ['player_name', 'team_name', 'img', 'position']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
        print("Writing player data...")

# Persist data for global access 
def persist_team_data(id, team):
    session[f'team{id}'] = team.name
    session[f'team{id}_players'] = [player.__dict__ for player in team.players]   
