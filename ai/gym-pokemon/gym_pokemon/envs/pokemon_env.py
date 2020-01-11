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

		self.action_space = spaces.Dict({
			"moveActionsDiscrete": spaces.MultiBinary(NUM_MOVES), # which moves BUB can choose
			"switchActionsDiscrete": spaces.MultiBinary(NUM_POKEMON) # which pokemon BUB can switch to
		})

		self.observation_space = spaces.Dict({
			"mySide": spaces.Dict({
				"stealthRocks": spaces.MultiBinary(1),
				"stickyWeb": spaces.MultiBinary(1),
				"spikesLevel": spaces.Discrete(4),
				"toxicSpikesLevel": spaces.Discrete(3),
				"lightScreen": spaces.Discrete(9), # 0-8 turns remaining
				"reflect": spaces.Discrete(9),
				"auroraVeil": spaces.Discrete(9),
				"tailwind": spaces.Discrete(6),
				"activePokemon": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke1": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke2": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke3": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke4": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke5": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke6": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
			}),
			"oppSide": spaces.Dict({
				"stealthRocks": spaces.MultiBinary(1),
				"stickyWeb": spaces.MultiBinary(1),
				"spikesLevel": spaces.Discrete(4),
				"toxicSpikesLevel": spaces.Discrete(3),
				"lightScreen": spaces.Discrete(9), # 0-8 turns remaining
				"reflect": spaces.Discrete(9),
				"auroraVeil": spaces.Discrete(9),
				"tailwind": spaces.Discrete(6),
				"activePokemon": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke1": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke2": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke3": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke4": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke5": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
				"poke6": spaces.Dict({
					"num": spaces.Discrete(NUM_POKEMON + 1), # 0 is none
					"knownMoves": spaces.MultiDiscrete([ NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1, NUM_MOVES+1 ]), # 0 is unknown/none
					"possibleMoves": spaces.MultiBinary(NUM_MOVES),
					"types": spaces.MultiBinary(NUM_TYPES), # or multidiscrete ?
					"nonVolatileStatus": spaces.Discrete(NUM_NON_VOLATIVE_STATUSES),
					"volatileStatus": spaces.MultiBinary(NUM_VOLATILE_STATUSES),
					"baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
					"battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
					"item": spaces.Discrete(NUM_ITEMS + 1),
					"itemConsumed": spaces.MultiBinary(1),
					"knownAbility": spaces.Discrete(NUM_ABILITIES), # 0 is unknown/none, included in AbilityArray so no +1
					"possibleAbilities": spaces.MultiBinary(NUM_ABILITIES) # or multidiscrete ?
				}),
			}),
			"weather": spaces.Discrete(5), # 0 is none
			"terrain": spaces.Discrete(5), # 0 is none
			"turn": spaces.Box(min=1, max=np.inf, shape=(1,1), dtype=np.int32)
		})
				

	# At each step we will take the specified action (chosen by our model), 
	#     calculate the reward, and return the next observation.
	def step(self, action):
		if self.done == 1:
			print("Game Over")
			return [self.state, self.reward, self.done]

		self.counter += 1

		# modify self.state, self.reward, self.done, 

		# select something to do
		# wait for turn to complete
		# get the new state

		return [self.state, self.reward, self.done]
		
		
	# called any time a new environment is created, or to reset an existing environment’s state
	# here we set the team available to BUB, all the info we have about his opponents team, etc.
	def reset(self):
		self.counter = 0
		self.done = 0
		self.reward = 0
		return self.state
		
	# Render the environment to the screen. 
	# For tictactoe this is just updating the board, but for BUB we could do 
	#     some cool things to visualize his little brain
	def render(self):
		pass
