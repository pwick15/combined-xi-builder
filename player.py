class Player:
    
    def __init__(self, name):
        self.name= name
    
    def create_player(name, position_list):
        # assign player a position based on position input
        if len(position_list) != 0:
            for position in position_list:
                if len(position.split(" ")) == 1: # more than one word means invalid position
                    position = position.upper()
                    if (position == "GK"):
                        # create goal keeper player type
                        return Goalkeeper(name)
                    elif (position == "D" or position.startswith("D(")):
                        return Defender(name)
                    elif (position == "M" or position.startswith("M(")):
                        return Midfielder(name)
                    elif (position == "F" or position.startswith("F(")):
                        return Forward(name)
            print("FOUND INVALID PLAYER")
            return None
    # def print_player(self):
    #     print(f"Name: {self.name}, Position: {self.position}")

class Goalkeeper(Player):
    def __init__(self, name):
        super().__init__(name)
        self.position = "GK"

class Defender(Player):
    def __init__(self, name):
        super().__init__(name)
        self.position = "DEF"

class Midfielder(Player):
    def __init__(self, name):
        super().__init__(name)
        self.position = "MID"

class Forward(Player):
    def __init__(self, name):
        super().__init__(name)
        self.position = "FOR"