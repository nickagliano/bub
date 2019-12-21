export type PokeType = "normal" | "fire" | "fighting" | "water" | "flying" | "grass" | "poison" | "electric" | "ground" | "psychic" | "rock" | "ice" | "bug" | "dragon" | "ghost" | "dark" | "steel" | "fairy" | "???";

export type PokeStatus = "none" | "burn" | "freeze" | "paralysis" | "poison" | "toxic poison" | "sleep";
export type VolatilePokeStatus = "bind" | "confuse" | "trap" | "curse" | "embargo" | "encore" | "flinch" | "heal block" | "identify" | "infatuate" | "ground" | "leech seed" | "nightmare" | "perish song" | "taunt" | "telekinesis" | "torment" | "aqua ring" | "endure" | "charge move" | "center of attention" | "defense curl" | "root" | "magic coat" | "magnetic levitate" | "minimize" | "protect" | "recharge" | "fly" | "dig" | "dive" | "shadow force" | "substitute" | "lock on" | "withdraw";
export type MoveEffect = PokeStatus | VolatilePokeStatus | "heal" | "drain" | "refresh";

export interface MoveData
{
    power: number;
    type: PokeType;
    statusEffects: MoveEffect[];
    statusTargets: ("self" | "opponent")[];
    statusLikelihoods: number[];
    pp: number;
    category: "physical" | "special" | "status";
    healType: "none" | "50%" | "100%" | "moonlight" | "morning sun" | "purify" | "shore up" | "strength sap" | "sythesis";
};

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
    status: PokeStatus;
    volatileStatuses: VolatilePokeStatus[];
    baseStats: PokeBaseStats;
    actualStats: PokeBattleStats;
    item: string; // we'll need an item dex..? idk x_x
    itemConsumed: boolean;
    ability: string; // special case for this and item if we don't know (like "unknown")
};

export interface HazardData
{
    stealthRocks: boolean;
    spikesLevel: number;
};

export interface GameState
{
    myPokemon: PokeData[];
    oppPokemon: PokeData[];
    myActivePokemon: PokeData;
    oppActivePokemon: PokeData;
    weather: "none" | "sand" | "rain" | "sun";
    screens: "none" | "lightScreen" | "reflect" | "both";
    hazardsMySide: HazardData;
    hazardsOppSide: HazardData;
    tailwind: boolean;
    terrain: "none" | "psychic" | "electric" | "fairy" | "grassy";
    turn: number;
};