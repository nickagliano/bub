from gym.envs.registration import register

register(
    id='pokemon-v0',
    entry_point='gym_pokemon.envs:Pokemon',
)