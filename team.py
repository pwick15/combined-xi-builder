from player import *

class Team:
    def __init__(self, name):
        self.name = name
        self.players = []

    # Return the number of players in the team
    def __len__(self):
            return len(self.players)  
    
    def add_player_to_team(self, player):
        if isinstance(player, Player):
            self.players.append(player)
        