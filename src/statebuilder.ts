import { NUM_MOVES, NUM_ABILITIES, NUM_TYPES, NUM_VOLATILE_STATUSES, BattlePokedex, PokemonArray, AbilityArray, MoveArray, BattleLearnsets, TypeArray, ItemArray, StatusArray, StatArray, WeatherArray, NUM_STATS, VolatileStatusArray } from "./data/data";

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
    battleStatBoosts: number[];
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
    battleStatBoosts: [ 0, 0, 0, 0, 0, 0, 0, 0 ],
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
            let learnset = [];

            if (BattleLearnsets.hasOwnProperty(cleanName))
            {
                learnset = Object.keys(BattleLearnsets[cleanName].learnset);
            }
            else
            {
                const base = formatName(BattlePokedex[cleanName].baseSpecies);
                learnset = Object.keys(BattleLearnsets[base].learnset);
            }

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
                possibleMoves: learnedBitfield(MoveArray, learnset),
                types: learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(formatName)),
                volatileStatus: Array(NUM_VOLATILE_STATUSES).fill(0)
            } as BUBStatePokeData;
        }
    }

    getActivePokemonFromToken(pokemonToken: string): BUBStatePokeData
    {
        return this.getSideFromPokemonToken(pokemonToken).activePokemon;
    }

    getTeamPokemonFromToken(pokemonToken: string, details: string): BUBStatePokeData
    {
        const cleanName = formatName(details.split(",")[0]);
        const side = this.getSideFromPokemonToken(pokemonToken);
        const num = PokemonArray.indexOf(cleanName);
        
        const candidates = [
            side.poke1,
            side.poke2,
            side.poke3,
            side.poke4,
            side.poke5,
            side.poke6
        ];

        return candidates.find(c => c.num === num);
    }

    getSideFromPokemonToken(pokemonToken: string): BUBStateBattleSide
    {
        const side : "p1" | "p2" = pokemonToken.split(":")[0].substr(0, 2) as "p1" | "p2";
        if (side === this.side)
        {
            return this.state.mySide;
        }
        else
        {
            return this.state.oppSide;
        }
    }

    getHpFromToken(hpToken: string): number
    {
        return Math.round(hpToken.split(" ")[0].split("/").map(parseInt).reduce((a, b) => a / b) * 100);
    }

    parseSetHp(pokemonToken: string, hpToken: string)
    {
        this.getActivePokemonFromToken(pokemonToken).battleStats[0] = this.getHpFromToken(hpToken);
    }

    parseStatus(pokemonToken: string, status: string)
    {
        this.getActivePokemonFromToken(pokemonToken).nonVolatileStatus = StatusArray.indexOf(status);
    }

    parseCureStatus(pokemonToken: string, status: string)
    {
        this.getActivePokemonFromToken(pokemonToken).nonVolatileStatus = 0;
    }

    parseCureTeam(pokemonToken: string)
    {
        const side = this.getSideFromPokemonToken(pokemonToken);
        side.activePokemon.nonVolatileStatus = 0;
        side.poke1.nonVolatileStatus = 0;
        side.poke2.nonVolatileStatus = 0;
        side.poke3.nonVolatileStatus = 0;
        side.poke4.nonVolatileStatus = 0;
        side.poke5.nonVolatileStatus = 0;
        side.poke6.nonVolatileStatus = 0;
    }

    parseBoost(sign: number, pokemonToken: string, stat: string, amount: string)
    {
        this.getActivePokemonFromToken(pokemonToken).battleStatBoosts[StatArray.indexOf(stat)] += parseInt(amount) * sign;
    }

    parseSetBoost(pokemonToken: string, stat: string, stage: string)
    {
        this.getActivePokemonFromToken(pokemonToken).battleStatBoosts[StatArray.indexOf(stat)] = parseInt(stage);
    }

    parseSwapBoost(sourcePokemonToken: string, targetPokemonToken: string, stats: string)
    {
        const statArray: string[] = stats.split(",").map(s => s.trim());
        const src = this.getActivePokemonFromToken(sourcePokemonToken);
        const dest = this.getActivePokemonFromToken(targetPokemonToken);

        statArray.forEach((stat) =>
        {
            const index = StatArray.indexOf(stat);
            const tmp = src.battleStatBoosts[index];
            src.battleStatBoosts[index] = dest.battleStatBoosts[index];
            dest.battleStatBoosts[index] = tmp;
        });
    }

    parseInvertBoost(pokemonToken: string)
    {
        const pokemon = this.getActivePokemonFromToken(pokemonToken);
        pokemon.battleStatBoosts = pokemon.battleStatBoosts.map(boost => -boost);
    }

    parseClearBoost(pokemonToken: string)
    {
        const pokemon = this.getActivePokemonFromToken(pokemonToken);
        pokemon.battleStatBoosts = pokemon.battleStatBoosts.map(boost => 0);
    }

    parseClearAllBoost()
    {
        this.state.mySide.activePokemon.battleStatBoosts = this.state.mySide.activePokemon.battleStatBoosts.map(boost => 0);
        this.state.oppSide.activePokemon.battleStatBoosts = this.state.oppSide.activePokemon.battleStatBoosts.map(boost => 0);
    }

    parseClearPositiveBoost(pokemonToken: string, sourcePokemonString: string, effect: string)
    {
        this.state.mySide.activePokemon.battleStatBoosts = this.state.mySide.activePokemon.battleStatBoosts.map(boost => boost > 0 ? 0 : boost);
    }

    parseClearNegativeBoost(pokemonToken: string, sourcePokemonString: string, effect: string)
    {
        this.state.mySide.activePokemon.battleStatBoosts = this.state.mySide.activePokemon.battleStatBoosts.map(boost => boost < 0 ? 0 : boost);
    }

    parseCopyBoost(sourcePokemonToken: string, targetPokemonToken: string)
    {
        const src = this.getActivePokemonFromToken(sourcePokemonToken);
        const dest = this.getActivePokemonFromToken(targetPokemonToken);
        src.battleStatBoosts = dest.battleStatBoosts.map(boost => boost);
    }

    parseWeather(weather: string)
    {
        this.state.weather = WeatherArray.indexOf(weather);
    }

    parseFieldStart(condition: string)
    {
        // TODO
    }

    parseFieldEnd(condition: string)
    {
        // TODO
    }

    parseSideStart(sideToken: string, condition: string)
    {
        // TODO
    }

    parseSideEnd(sideToken: string, condition: string)
    {
        // TODO
    }

    parseStart(pokemonToken: string, volatileStatus: string)
    {
        this.getActivePokemonFromToken(pokemonToken).volatileStatus[VolatileStatusArray.indexOf(volatileStatus)] = 1;
    }

    parseEnd(pokemonToken: string, volatileStatus: string)
    {
        this.getActivePokemonFromToken(pokemonToken).volatileStatus[VolatileStatusArray.indexOf(volatileStatus)] = 0;
    }

    parseItem(pokemonToken: string, item: string, effect: string)
    {
        this.getActivePokemonFromToken(pokemonToken).item = ItemArray.indexOf(item);
    }

    parseEndItem(pokemonToken: string, item: string, effect: string)
    {
        this.getActivePokemonFromToken(pokemonToken).item = 0;
        this.getActivePokemonFromToken(pokemonToken).itemConsumed = 1;
    }

    parseAbility(pokemonToken: string, ability: string, effect: string)
    {
        this.getActivePokemonFromToken(pokemonToken).knownAbility = AbilityArray.indexOf(ability);
    }

    parseEndAbility(pokemonToken: string, ability: string, effect: string)
    {
        this.getActivePokemonFromToken(pokemonToken).knownAbility = AbilityArray.indexOf(ability);
        // TODO: suppression
    }

    parseTransform(pokemonToken: string, species: string)
    {
        // basestats, possibleAbilities, possibleMoves, types
        const cleanName = formatName(species);
        let learnset = [];

        if (BattleLearnsets.hasOwnProperty(cleanName))
        {
            learnset = Object.keys(BattleLearnsets[cleanName].learnset);
        }
        else
        {
            const base = formatName(BattlePokedex[cleanName].baseSpecies);
            learnset = Object.keys(BattleLearnsets[base].learnset);
        }

        const poke = this.getActivePokemonFromToken(pokemonToken);
        poke.baseStats = Object.values(BattlePokedex[cleanName].baseStats);
        poke.possibleAbilities = learnedBitfield(AbilityArray, Object.values(BattlePokedex[cleanName].abilities).map(formatName));
        poke.possibleMoves = learnedBitfield(MoveArray, Object.keys(BattleLearnsets[cleanName].learnset));
        poke.types = learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(formatName));

        // TODO: update battle stats if bub is transforming
    }

    parseActivate(effect: string)
    {
        console.log("an awesome effect happened: " + effect);
    }

    parseTurn(turn: string)
    {
        this.state.turn = parseInt(turn);
    }

    parseMove(attackingPokemonToken: string, move: string, defendingPokemonToken: string)
    {
        const side = this.getSideFromPokemonToken(attackingPokemonToken);

        if (side == this.state.oppSide)
        {
            side.activePokemon.knownMoves[MoveArray.indexOf(move)] = 1;
        }
    }

    parsePrepare(attackingPokemonToken: string, move: string, defendingPokemonToken: string)
    {
        // TODO
    }

    parseMustRecharge(pokemonToken: string)
    {
        // TODO
    }

    parseSingleMove(pokemonToken: string, move: string)
    {
        // TODO
        // const effectName = formatName(move);
        // const index = VolatileStatusArray.indexOf(move);

        // if (index !== -1)
        // {
        //     this.getActivePokemonFromToken(pokemonToken).volatileStatus[index] = 1;
        // }
    }

    parseSingleTurn(pokemonToken: string, move: string)
    {
        // TODO
    }

    parseSwitch(pokemonToken: string, details: string, hpToken: string)
    {
        const side = this.getSideFromPokemonToken(pokemonToken);
        const newPoke = this.getTeamPokemonFromToken(pokemonToken, details);

        // TODO: remove boosts, etc from old active pokemon

        side.activePokemon = JSON.parse(JSON.stringify(newPoke));
    }

    parseDetailsChange(pokemonToken: string, newSpecies: string, hpToken: string)
    {
        // basestats, possibleAbilities, possibleMoves, types
        const cleanName = formatName(newSpecies);
        let learnset = [];

        if (BattleLearnsets.hasOwnProperty(cleanName))
        {
            learnset = Object.keys(BattleLearnsets[cleanName].learnset);
        }
        else
        {
            const base = formatName(BattlePokedex[cleanName].baseSpecies);
            learnset = Object.keys(BattleLearnsets[base].learnset);
        }

        const poke = this.getActivePokemonFromToken(pokemonToken);
        poke.baseStats = Object.values(BattlePokedex[cleanName].baseStats);
        poke.possibleAbilities = learnedBitfield(AbilityArray, Object.values(BattlePokedex[cleanName].abilities).map(formatName));
        poke.possibleMoves = learnedBitfield(MoveArray, Object.keys(BattleLearnsets[cleanName].learnset));
        poke.types = learnedBitfield(TypeArray, BattlePokedex[cleanName].types.map(formatName));

        if (hpToken)
        {
            this.parseSetHp(pokemonToken, hpToken);
        }
    }

    parseFaint(pokemonToken: string)
    {
        const pokemon = this.getActivePokemonFromToken(pokemonToken);
        pokemon.battleStats[0] = 0;
        pokemon.nonVolatileStatus = StatusArray.indexOf("fnt");
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
                    this.getHpFromToken(p.condition),
                    ...Object.values(p.stats) as number[],
                    1,
                    1
                ],
                battleStatBoosts: Array(NUM_STATS).fill(0),
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