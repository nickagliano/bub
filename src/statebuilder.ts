import { NUM_MOVES, NUM_ABILITIES, NUM_TYPES, NUM_VOLATILE_STATUSES, BattlePokedex, PokemonArray, AbilityArray, MoveArray, BattleLearnsets, TypeArray, ItemArray } from "./data/data";

export type TranslatedBubState = number[];

export interface BUBStatePokeData
{
    num: number;
    knownMoves: (0 | 1)[];
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
    knownMoves: Array(NUM_MOVES).fill(0),
    nonVolatileStatus: 0,
    possibleAbilities: Array(NUM_ABILITIES).fill(0),
    possibleMoves: Array(NUM_MOVES).fill(0),
    types: Array(NUM_TYPES).fill(0),
    volatileStatus: Array(NUM_VOLATILE_STATUSES).fill(0)
};

/**
 * @returns Pokemon/ability/move/etc name without spaces, etc, for use with the data arrays n such
 * @param name Name of the pokemon/move/whatever
 */
function formatName(name: string)
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

function zeroIfNotFound(index: number)
{
    return index === -1 ? 0 : index;
}

function learnedBitfield(array: any[], valuesKnown: any[]): (0 | 1)[]
{
    const bitfield = Array(array.length - 1).fill(0); // - 1 since array includes nopokemon/nomove/etc
    for (const valueKnown of valuesKnown)
    {
        const index = array.indexOf(valueKnown) - 1;
        if (index >= 0)
        {
            bitfield[index] = 1;
        }
    }

    return bitfield;
};

function unpackPokemon(poke: BUBStatePokeData): number[]
{
    const ret = [
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

    return ret;
}

function unpackSide(side: BUBStateBattleSide): number[]
{
    const ret = [
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

    return ret;
}

export default class StateBuilder
{
    private state: BUBState;
    private side: "p1" | "p2" = "p1";
    private pokeCounter: number = 0;

    constructor()
    {
        // 26373
    }

    public getState(): TranslatedBubState
    {
        const ret = [
            ...unpackSide(this.state.mySide),
            ...unpackSide(this.state.oppSide),
            this.state.weather,
            this.state.terrain,
            this.state.turn
        ];

        return ret;
    }

    parsePoke(side: "p1" | "p2", details: string)
    {
        if (side !== this.side)
        {
            const cleanName = formatName(details.split(",")[0]);
            this.state.oppSide["poke" + (++this.pokeCounter).toString()] = {
                baseStats: Object.values(BattlePokedex[cleanName].baseStats),
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
                possibleAbilities: learnedBitfield(AbilityArray, Object.values(BattlePokedex[cleanName].abilities).map(formatName)),
                possibleMoves: learnedBitfield(MoveArray, Object.keys(BattleLearnsets[cleanName].learnset)),
                types: learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(formatName)),
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
            const cleanName = formatName(p.details.split(",")[0]);

            return {
                baseStats: Object.values(BattlePokedex[cleanName].baseStats),
                battleStats: [
                    p.condition.split("/")[0],
                    ...Object.values(p.stats),
                    1,
                    1
                ],
                item: zeroIfNotFound(ItemArray.indexOf(p.item)),
                itemConsumed: 0,
                knownAbility: zeroIfNotFound(AbilityArray.indexOf(p.ability)),
                knownMoves: learnedBitfield(MoveArray, p.moves),
                nonVolatileStatus: 0,
                num: zeroIfNotFound(PokemonArray.indexOf(cleanName)),
                possibleAbilities: learnedBitfield(AbilityArray, Object.values(BattlePokedex[cleanName].abilities).map(formatName)),
                possibleMoves: learnedBitfield(MoveArray, Object.keys(BattleLearnsets[cleanName].learnset)),
                types: learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(formatName)),
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