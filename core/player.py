class Player:
    
    def __init__(self, player_name, team_name):
        self.player_name = player_name
        self.team_name = team_name
    
    def create_player(player_name, team_name, position_list):
        # assign player a position based on position input
        if len(position_list) != 0:
            for position in position_list:
                if len(position.split(" ")) == 1: # more than one word means invalid position
                    position = position.upper()
                    if (position == "GK"):
                        # create goal keeper player type
                        return Goalkeeper(player_name, team_name)
                    elif (position == "D" or position.startswith("D(")):
                        return Defender(player_name, team_name)
                    elif (position == "M" or position.startswith("M(")):
                        return Midfielder(player_name, team_name)
                    elif (position == "F" or position.startswith("F(")):
                        return Forward(player_name, team_name)
            print("FOUND INVALID PLAYER")
            return None
    # def print_player(self):
    #     print(f"Name: {self.player_name}, Position: {self.position}")

class Goalkeeper(Player):
    def __init__(self, player_name, team_name):
        super().__init__(player_name,  team_name)
        self.position = "GK"

class Defender(Player):
    def __init__(self, player_name, team_name):
        super().__init__(player_name, team_name)
        self.position = "DEF"

class Midfielder(Player):
    def __init__(self, player_name, team_name):
        super().__init__(player_name, team_name)
        self.position = "MID"

class Forward(Player):
    def __init__(self, player_name, team_name):
        super().__init__(player_name, team_name)
        self.position = "FOR"