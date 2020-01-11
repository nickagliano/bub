############################################################################################################
##### this code is not meant to be run as-is, just drafting what the environment might look like       #####
############################################################################################################

from gym import spaces
import numpy as np

numMoves = 821
numNonVolatileStatuses = 7
numVolatileStatuses = 57
numTypes = 18
numItems = 413
numAbilities = 262
numPokemon = 1198

pokeData = spaces.Dict({
    "num": spaces.Discrete(numPokemon + 1), # 0 is none
    "knownMoves": spaces.MultiDiscrete([ numMoves+1, numMoves+1, numMoves+1, numMoves+1 ]), # 0 is unknown/none
    "possibleMoves": spaces.MultiBinary(numMoves),
    "types": spaces.MultiBinary(numTypes), # or multidiscrete ?
    "nonVolatileStatus": spaces.Discrete(numNonVolatileStatuses),
    "volatileStatus": spaces.MultiBinary(numVolatileStatuses),
    "baseStats": spaces.Box(low=0, high=np.inf, shape=(6,1), dtype=np.int32), # hp, atk, def, spa, spd, spe
    "battleStats": spaces.Box(low=0, high=np.inf, shape=(8,1), dtype=np.int32), # + acc, eva
    "item": spaces.Discrete(numItems + 1),
    "itemConsumed": spaces.MultiBinary(1),
    "knownAbility": spaces.Discrete(numAbilities), # 0 is unknown/none, included in AbilityArray so no +1
    "possibleAbilities": spaces.MultiBinary(numAbilities) # or multidiscrete ?
})

battleSide = spaces.Dict({
    "activePokemon": pokeData,
    "poke1": pokeData,
    "poke2": pokeData,
    "poke3": pokeData,
    "poke4": pokeData,
    "poke5": pokeData,
    "poke6": pokeData,
    "stealthRocks": spaces.MultiBinary(1),
    "stickyWeb": spaces.MultiBinary(1),
    "spikesLevel": spaces.Discrete(4),
    "toxicSpikesLevel": spaces.Discrete(3),
    "lightScreen": spaces.Discrete(9), # 0-8 turns remaining
    "reflect": spaces.Discrete(9),
    "auroraVeil": spaces.Discrete(9),
    "tailwind": spaces.Discrete(6)
})

observation_space = spaces.Dict({
    "mySide": battleSide,
    "oppSide": battleSide,
    "weather": spaces.Discrete(5), # 0 is none
    "terrain": spaces.Discrete(5), # 0 is none
    "turn": spaces.Box(min=1, max=np.inf, shape=(1,1), dtype=np.int32)
})

### OR JUST USE POKEMON NUMS AND BUB LEARNS FROM THAT .... ? ###

battleSide = spaces.Dict({
    "activePokemon": spaces.Discrete(numPokemon + 1), # 0 is none
    "team": spaces.MultiDiscrete([ numPokemon+1, numPokemon+1, numPokemon+1, numPokemon+1, numPokemon+1, numPokemon+1 ]), # 0 is none
    "stealthRocks": spaces.MultiBinary(1),
    "stickyWeb": spaces.MultiBinary(1),
    "spikesLevel": spaces.Discrete(4),
    "toxicSpikesLevel": spaces.Discrete(3),
    "lightScreen": spaces.Discrete(9), # 0-8 turns remaining
    "reflect": spaces.Discrete(9), # 0-8 turns remaining
    "auroraVeil": spaces.Discrete(9), # 0-8 turns remaining
    "tailwind": spaces.Discrete(6) # 0-5 turns remaining
})

observation_space = spaces.Dict({
    "mySide": battleSide,
    "oppSide": battleSide,
    "weather": spaces.Discrete(5), # 0 is none
    "terrain": spaces.Discrete(5), # 0 is none
    "turn": spaces.Box(min=1, max=np.inf, shape=(1,1), dtype=np.int32)
})


### POTENTIAL ACTION SPACES ..... ? ###

# action space made with multibinary (1 = can use that move/can switch to that poke, orders correspond with MoveArray and PokemonArray)
action_space = spaces.Dict({
	"moveActionsDiscrete": spaces.MultiBinary(numMoves), # which moves BUB can choose
	"switchActionsDiscrete": spaces.MultiBinary(numPokemon) # which pokemon BUB can switch to
})