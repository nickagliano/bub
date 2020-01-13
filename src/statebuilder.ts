import BattlePokedex from "./data/pokedex";
import ItemArray from "./data/itemarray";
import AbilityArray from "./data/abilityarray";
import MoveArray from "./data/movearray";
import PokemonArray from "./data/pokemonarray";
import BattleLearnsets from "./learnset";
import TypeArray from "./data/typearray";

const NUM_MOVES = 821;
const NUM_NON_VOLATIVE_STATUSES = 7;
const NUM_VOLATILE_STATUSES = 57;
const NUM_TYPES = 18;
const NUM_ITEMS = 413;
const NUM_ABILITIES = 261;
const NUM_POKEMON = 1198;

export type TranslatedBubState = number[];

export interface BUBStatePokeData
{
    num: number;
    knownMoves: number[];
    possibleMoves: (0 | 1)[];
    types: (0 | 1)[];
    nonVolatileStatus: number;
    volatileStatus: (0 | 1)[];
    baseStats: number[];
    battleStats: number[];
    item: number;
    itemConsumed: (0 | 1);
    knownAbility: number;
    possibleAbilities: (0 | 1)[];
}

export interface BUBStateBattleSide
{
    stealthRocks: (0 | 1);
    stickyWeb: (0 | 1);
    spikesLevel: number;
    toxicSpikesLevel: number;
    lightScreen: number;
    reflect: number;
    auroraVeil: number;
    tailwind: number;
    activePokemon: BUBStatePokeData;
    poke1: BUBStatePokeData;
    poke2: BUBStatePokeData;
    poke3: BUBStatePokeData;
    poke4: BUBStatePokeData;
    poke5: BUBStatePokeData;
    poke6: BUBStatePokeData;
}

export interface BUBState
{
    mySide: BUBStateBattleSide;
    oppSide: BUBStateBattleSide;
    weather: number;
    terrain: number;
    turn: number;
}

const DefaultPokemon: BUBStatePokeData = {
    num: 0,
    baseStats: [ 0, 0, 0, 0, 0, 0 ],
    battleStats: [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    item: 0,
    itemConsumed: 0,
    knownAbility: 0,
    knownMoves: [ 0, 0, 0, 0 ],
    nonVolatileStatus: 0,
    possibleAbilities: Array(NUM_ABILITIES).fill(0),
    possibleMoves: Array(NUM_MOVES).fill(0),
    types: Array(NUM_TYPES).fill(0),
    volatileStatus: Array(NUM_VOLATILE_STATUSES).fill(0)
};

/**
 * @returns Pokemon's name without spaces, etc, for use with BattlePokedex
 * @param name Name of the pokemon
 */
function cleanPokeName(name: string)
{
    const allowed = "abcdefghijklmnopqrstuvwxyz1234567890";
    let ret = "";

    name = name.toLowerCase();

    for (const char of name)
    {
        if (allowed.includes(char))
        {
            ret += char;
        }
    }

    return ret;
}

function obj_values(obj: Record<string, any>): any[]
{
    const ret = [];
    for (const key in obj)
    {
        ret.push(obj[key]);
    }

    return ret;
};

function obj_keys(obj: Record<string, any>): string[]
{
    const ret = [];
    for (const key in obj)
    {
        ret.push(key);
    }

    return ret;
};

function zeroIfNotFound(index: number)
{
    return index === -1 ? 0 : index;
}

function learnedBitfield(array: any[], valuesKnown: any[]): (0 | 1)[]
{
    const arr = Array(array.length).fill(0);
    for (const valueKnown of valuesKnown)
    {
        const index = array.indexOf(valueKnown);
        if (index !== -1)
        {
            arr[index] = 1;
        }
    }

    return arr;
};

function unpackPokemon(poke: BUBStatePokeData): number[]
{
    return [
        poke.num,
        ...poke.knownMoves,
        ...poke.possibleMoves,
        ...poke.types,
        poke.nonVolatileStatus,
        ...poke.volatileStatus,
        ...poke.baseStats,
        ...poke.battleStats,
        poke.item,
        poke.itemConsumed,
        poke.knownAbility,
        ...poke.possibleAbilities
    ];
}

function unpackSide(side: BUBStateBattleSide): number[]
{
    return [
        side.stealthRocks,
        side.stickyWeb,
        side.spikesLevel,
        side.toxicSpikesLevel,
        side.lightScreen,
        side.reflect,
        side.auroraVeil,
        side.tailwind,
        ...unpackPokemon(side.activePokemon),
        ...unpackPokemon(side.poke1),
        ...unpackPokemon(side.poke2),
        ...unpackPokemon(side.poke3),
        ...unpackPokemon(side.poke4),
        ...unpackPokemon(side.poke5),
        ...unpackPokemon(side.poke6),
    ];
}

export default class StateBuilder
{
    private state: BUBState;
    private side: "p1" | "p2" = "p1";
    private pokeCounter: number = 0;

    constructor()
    {

    }

    public getState(): TranslatedBubState
    {
        return [
            ...unpackSide(this.state.mySide),
            ...unpackSide(this.state.oppSide),
            this.state.weather,
            this.state.terrain,
            this.state.turn
        ];
    }

    parsePoke(side: "p1" | "p2", details: string)
    {
        if (side !== this.side)
        {
            const cleanName = cleanPokeName(details.split(",")[0]);
            this.state.oppSide["poke" + (++this.pokeCounter).toString()] = {
                baseStats: obj_values(BattlePokedex[cleanName].baseStats),
                battleStats: [
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1
                ],
                item: 0,
                itemConsumed: 0,
                knownAbility: 0,
                knownMoves: Array(NUM_MOVES).fill(0),
                nonVolatileStatus: 0,
                num: zeroIfNotFound(PokemonArray.indexOf(cleanName)),
                possibleAbilities: learnedBitfield(AbilityArray, obj_values(BattlePokedex[cleanName].abilities).map(a => a.toLowerCase())),
                possibleMoves: learnedBitfield(MoveArray, obj_keys(BattleLearnsets[cleanName].learnset)),
                types: learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(t => t.toLowerCase())),
                volatileStatus: Array(NUM_VOLATILE_STATUSES).fill(0)
            } as BUBStatePokeData;
        }
    }

    clearPoke()
    {
        this.pokeCounter = 0;
    }

    parseFirstRequest(requestJson: any)
    {
        const side = requestJson.side;

        const poke = (index: number): BUBStatePokeData =>
        {
            const p = side.pokemon[index];
            const cleanName = cleanPokeName(p.details.split(",")[0]);

            return {
                baseStats: obj_values(BattlePokedex[cleanName].baseStats),
                battleStats: [
                    p.condition.split("/")[0],
                    ...obj_values(p.stats),
                    1,
                    1
                ],
                item: zeroIfNotFound(ItemArray.indexOf(p.item)),
                itemConsumed: 0,
                knownAbility: zeroIfNotFound(AbilityArray.indexOf(p.ability)),
                knownMoves: learnedBitfield(MoveArray, p.moves),
                nonVolatileStatus: 0,
                num: zeroIfNotFound(PokemonArray.indexOf(cleanName)),
                possibleAbilities: learnedBitfield(AbilityArray, obj_values(BattlePokedex[cleanName].abilities).map(a => a.toLowerCase())),
                possibleMoves: learnedBitfield(MoveArray, obj_keys(BattleLearnsets[cleanName].learnset)),
                types: learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(t => t.toLowerCase())),
                volatileStatus: Array(NUM_VOLATILE_STATUSES).fill(0)
            }
        };

        this.side = side.id;

        this.state = {
            mySide: {
                activePokemon: DefaultPokemon,
                poke1: poke(0),
                poke2: poke(1),
                poke3: poke(2),
                poke4: poke(3),
                poke5: poke(4),
                poke6: poke(5),
                auroraVeil: 0,
                lightScreen: 0,
                reflect: 0,
                spikesLevel: 0,
                stealthRocks: 0,
                stickyWeb: 0,
                tailwind: 0,
                toxicSpikesLevel: 0
            },
            oppSide: {
                activePokemon: DefaultPokemon,
                poke1: DefaultPokemon,
                poke2: DefaultPokemon,
                poke3: DefaultPokemon,
                poke4: DefaultPokemon,
                poke5: DefaultPokemon,
                poke6: DefaultPokemon,
                auroraVeil: 0,
                lightScreen: 0,
                reflect: 0,
                spikesLevel: 0,
                stealthRocks: 0,
                stickyWeb: 0,
                tailwind: 0,
                toxicSpikesLevel: 0
            },
            terrain: 0,
            turn: 0,
            weather: 0
        };
    }
}