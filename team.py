from player import *

class Team:
    def __init__(self, name):
        self.name = name
        self.players = []

    def __len__(self):
            return len(self.players)  
    
    def add_player_to_team(self, player):
        if isinstance(player, Player):
            self.players.append(player)
            
    # print players in the team
    def view_team(self):
        players = self.players
        gks = []
        defs = []
        mids = []
        fors = []
        for player in players:
            if player.position == "GK":
                gks.append(player)
            elif player.position == "DEF":
                defs.append(player)
            elif player.position == "MID":
                mids.append(player)
            elif player.position == "FOR":
                fors.append(player)
        print(f'PLAYERS OF {self.name.upper()}')
        print(f'\nGOALKEEPERS:')
        for player in gks:
            print(f'{player.name}')
        print(f'\nDEFENDERS:')
        for player in defs:
            print(f'{player.name}')
        print(f'\nMIDFIELDERS:')
        for player in mids:
            print(f'{player.name}')
        print(f'\nFORWARDS:')
        for player in fors:
            print(f'{player.name}')