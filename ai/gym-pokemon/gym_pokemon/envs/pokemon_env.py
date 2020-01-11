# THIS IS A ROUGH DRAFT!!!! MOSTLY PLAYING AROUND TO SEE HOW THINGS WORK!!

import gym
from gym import spaces
import numpy as np

# declare constants
NUM_MOVES = 821
NUM_NON_VOLATIVE_STATUSES = 7
NUM_VOLATILE_STATUSES = 57
NUM_TYPES = 18
NUM_ITEMS = 413
NUM_ABILITIES = 262
NUM_POKEMON = 1198

# the code below was just taken from a tictactoe environment, it still needs
#     to be adapted to the pokemon environment

class Pokemon(gym.Env):
"""A Pokémon Showdown environment for OpenAI gym"""
	
	# the init function is where the observation_space and action_space will be defined
	def __init__(self):
		self.state = []
		for i in range(3):
			self.state += [[]]
			for j in range(3):
				self.state[i] += ["-"]
		self.counter = 0
		self.done = 0
		self.add = [0, 0]
		self.reward = 0

	# the check function isn't actually required
	# used to check if a certain condition has been met
	# for tictactoe, it's used to see if someone has won 
	def check(self):
		if(self.counter<5):
			return 0
		for i in range(3):
			if(self.state[i][0] != "-" and self.state[i][1] == self.state[i][0] and self.state[i][1] == self.state[i][2]):
				if(self.state[i][0] == "o"):
					return 1
				else:
					return 2
			if(self.state[0][i] != "-" and self.state[1][i] == self.state[0][i] and self.state[1][i] == self.state[2][i]):
				if(self.state[0][i] == "o"):
					return 1
				else:
					return 2
		if(self.state[0][0] != "-" and self.state[1][1] == self.state[0][0] and self.state[1][1] == self.state[2][2]):
			if(self.state[0][0] == "o"):
				return 1
			else:
				return 2
		if(self.state[0][2] != "-" and self.state[0][2] == self.state[1][1] and self.state[1][1] == self.state[2][0]):
			if(self.state[1][1] == "o"):
				return 1
			else:
				return 2
				

	# At each step we will take the specified action (chosen by our model), 
	#     calculate the reward, and return the next observation.
	def step(self, target):
		if self.done == 1:
			print("Game Over")
			return [self.state, self.reward, self.done, self.add]
		elif self.state[int(target/3)][target%3] != "-":
			print("Invalid Step")
			return [self.state, self.reward, self.done, self.add]
		else:
			if(self.counter%2 == 0):
				self.state[int(target/3)][target%3] = "o"
			else:
				self.state[int(target/3)][target%3] = "x"
			self.counter += 1
			if(self.counter == 9):
				self.done = 1;
			self.render()

		win = self.check()
		if(win):
			self.done = 1;
			print("Player ", win, " wins.", sep = "", end = "\n")
			self.add[win-1] = 1;
			if win == 1:
				self.reward = 100
			else:
				self.reward = -100

		return [self.state, self.reward, self.done, self.add]
		
		
	# called any time a new environment is created, or to reset an existing environment’s state
	# here we set the team available to BUB, all the info we have about his opponents team, etc.
	def reset(self):
		for i in range(3):
			for j in range(3):
				self.state[i][j] = "-"
		self.counter = 0
		self.done = 0
		self.add = [0, 0]
		self.reward = 0
		return self.state
		
	# Render the environment to the screen. 
	# For tictactoe this is just updating the board, but for BUB we could do 
	#     some cool things to visualize his little brain
	def render(self):
		for i in range(3):
			for j in range(3):
				print(self.state[i][j], end = " ")
			print("")
