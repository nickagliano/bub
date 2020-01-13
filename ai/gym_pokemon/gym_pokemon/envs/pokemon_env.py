# THIS IS A ROUGH DRAFT!!!! MOSTLY PLAYING AROUND TO SEE HOW THINGS WORK!!

import gym
from gym import spaces
import numpy as np
import json

def getLen(name):
	with open("data/" + name + ".json") as content_file:
		content = content_file.read()
	return len(json.loads(content)) - 1

# declare constants
NUM_MOVES = getLen("movearray")
NUM_NON_VOLATIVE_STATUSES = 7
NUM_VOLATILE_STATUSES = getLen("volatilestatusarray")
NUM_TYPES = getLen("typearray")
NUM_ITEMS = getLen("itemarray")
NUM_ABILITIES = getLen("abilityarray")
NUM_POKEMON = getLen("pokemonarray")

Boolean = (0,1,1)

def Bitfield(n):
	return (0, 1, n)

def Discrete(minInc, maxInc):
	return (minInc, maxInc, 1)

def MultiDiscrete(minInc, maxInc, n):
	return (minInc, maxInc, n)

POKE_DICT = dict(
	num=Discrete(0, NUM_POKEMON + 1), # 0 is none
	knownMoves=Bitfield(NUM_MOVES), # 0 is unknown/none
	possibleMoves=Bitfield(NUM_MOVES),
	types=Bitfield(NUM_TYPES), # or multidiscrete ?
	nonVolatileStatus=Discrete(0, NUM_NON_VOLATIVE_STATUSES),
	volatileStatus=Bitfield(NUM_VOLATILE_STATUSES),
	baseStats=MultiDiscrete(0, 255, 6), # hp, atk, def, spa, spd, spe
	battleStats=MultiDiscrete(0, 999999999, 8), # + acc, eva
	item=Discrete(0, NUM_ITEMS + 1),
	itemConsumed=Boolean,
	knownAbility=Discrete(0, NUM_ABILITIES + 1), # 0 is unknown/none
	possibleAbilities=Bitfield(NUM_ABILITIES) # or multidiscrete ?
)

SIDE_DICT = dict(
	stealthRocks=Boolean,
	stickyWeb=Boolean,
	spikesLevel=Discrete(0, 5),
	toxicSpikesLevel=Discrete(0, 2),
	lightScreen=Discrete(0, 8), # 0-8 turns remaining
	reflect=Discrete(0, 8),
	auroraVeil=Discrete(0, 8),
	tailwind=Discrete(0, 5),
	activePokemon=POKE_DICT,
	poke1=POKE_DICT,
	poke2=POKE_DICT,
	poke3=POKE_DICT,
	poke4=POKE_DICT,
	poke5=POKE_DICT,
	poke6=POKE_DICT
)

# pokemon dictionary def
STATE_DICT = dict(
	mySide=SIDE_DICT,
	oppSide=SIDE_DICT,
	weather=Discrete(0, 4), # 0 is none
	terrain=Discrete(0, 4), # 0 is none
	turn=Discrete(0, np.inf)
)

def flatten_dict(d):
	ret = []

	for key, val in d.items():
		if isinstance(val, dict):
			ret.extend(flatten_dict(val))
		else:
			ret.append(val)

	return ret

def make_observation_space():
	d = flatten_dict(STATE_DICT)
	tuples = []

	for t in d:
		if t[2] == 1:
			tuples.append(t)
		else:
			for i in range(0, t[2]):
				tuples.append((t[0], t[1], 1))
				
	lows, highs, ignore = zip(*tuples)
	return spaces.Box(low=np.array(lows), high=np.array(highs))

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

		print(NUM_POKEMON)

		self.action_space = spaces.MultiBinary(NUM_MOVES + NUM_POKEMON);
		self.observation_space = make_observation_space()
		# print(self.observation_space)

	# At each step we will take the specified action (chosen by our model), 
	#     calculate the reward, and return the next observation.
	def step(self, action):
		if self.done == 1:
			# print("Game Over")
			return [self.state, self.reward, self.done]

		self.counter += 1

		# modify self.state, self.reward, self.done, 

		# select something to do
		# wait for turn to complete
		# get the new state

		return [self.state, self.reward, self.done]
		
		
	# called any time a new environment is created, or to reset an existing environment’s state
	# here we set the team available to BUB, all the info we have about his opponents team, etc.
	def reset(self, state):
		self.counter = 0
		self.done = 0
		self.reward = 0
		self.state = state
		return self.state
		
	# Render the environment to the screen. 
	# For tictactoe this is just updating the board, but for BUB we could do 
	#     some cool things to visualize his little brain
	def render(self):
		pass
