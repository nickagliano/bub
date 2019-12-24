// status stuff //

export type PokeType = "normal" | "fire" | "fighting" | "water" | "flying" | "grass" | "poison" | "electric" | "ground" | "psychic" | "rock" | "ice" | "bug" | "dragon" | "ghost" | "dark" | "steel" | "fairy" | "???";

export type NonvolatileStatusType = "none" | "burn" | "freeze" | "paralysis" | "poison" | "toxic poison" | "sleep";
export type VolatileStatusType = "bind" | "confuse" | "trap" | "curse" | "embargo" | "encore" | "flinch" | "heal block" | "identify" | "infatuate" | "ground" | "leech seed" | "nightmare" | "perish song" | "taunt" | "telekinesis" | "torment" | "aqua ring" | "endure" | "charge move" | "center of attention" | "defense curl" | "root" | "magic coat" | "magnetic levitate" | "minimize" | "protect" | "recharge" | "fly" | "dig" | "dive" | "shadow force" | "substitute" | "lock on" | "withdraw" | "safeguard";
export type MoveEffectType = NonvolatileStatusType | VolatileStatusType | "heal" | "drain" | "refresh"; // do we need heal and drain here since we have healType and drainType in MoveEffect?

export interface NonvolatileStatus
{
    type: NonvolatileStatusType;
    turnsElapsed: number;
};

export interface VolatileStatus
{
    type: VolatileStatusType;
    turnsElapsed: number;
};

// move stuff //

export interface MoveEffect
{
    type: MoveEffectType;
    statusTarget: "self" | "opponent";
    likelihood: number;
};

export interface MoveData
{
    power: number;
    type: PokeType;
    effects: MoveEffect[];
    pp: number;
    category: "physical" | "special" | "status";

    // should we represent these differently... like give conditions for healing amounts (e.g. halved in rain etc) //
    healType: "none" | "50%" | "100%" | "moonlight" | "morning sun" | "purify" | "shore up" | "strength sap" | "sythesis";
    drainType: "none" | "50%" | "75%" | "dream eater";
};

// pokemon stuff //

export interface PokeBaseStats
{
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
};

export interface PokeBattleStats extends PokeBaseStats
{
    accuracy: number;
    evasion: number;
};

export interface PokeData
{
    knownMoves: MoveData[];
    types: PokeType[];
    status: NonvolatileStatus;
    volatileStatuses: VolatileStatus[];
    baseStats: PokeBaseStats;
    battleStats: PokeBattleStats;
    item: string; // we'll need an item dex..? idk x_x
    itemConsumed: boolean;
    ability: string; // special case for this and item if we don't know (like "unknown")
};

// battle stuff //

export interface VariableTurnCount
{
    minTurnsRemaining: number;
    maxTurnsRemaining: number;
};

export interface BattleSide
{
    activePokemon: PokeData;
    team: PokeData[];
    stealthRocks: boolean;
    stickyWeb: boolean;
    spikesLevel: number;
    toxicSpikesLevel: number;
    lightScreen: VariableTurnCount;
    reflect: VariableTurnCount;
    auroraVeil: VariableTurnCount;
    tailwindRemaining: number;
};

export interface Weather extends VariableTurnCount
{
    type: "none" | "sand" | "rain" | "sun" | "hail";
};

export interface Terrain extends VariableTurnCount
{
    type: "none" | "psychic" | "electric" | "fairy" | "grassy";
};

export interface GameState
{
    mySide: BattleSide;
    oppSide: BattleSide;
    weather: Weather;
    terrain: Terrain;
    turn: number;
};