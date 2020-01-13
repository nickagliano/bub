import * as fs from "fs";

interface PokedexData
{
	num: number;
	species: string;
	types: string[];
	baseStats: {
		hp: number;
		atk: number;
		def: number;
		spa: number;
		spd: number;
		spe: number;
	};
	abilities: {[index: string]: string}
	gender?: any;
	heightm: number;
	weightkg: number;
	color: string;
	evos?: string[]
	baseSpecies?: string;
	forme?: string;
	baseForme?: string;
	otherFormes?: string[];
	inheritsFrom?: string;
};

function get(name: string): any
{
    let ret;

    try
    {
        ret = JSON.parse(fs.readFileSync("data/" + name + ".json", "utf8"));
    }
    catch (e)
    {
        if (e.code && e.code === "ENOENT")
        {
            console.error("Could not load data files! Try doing the following command:\nnpm run fetchdata");
            process.exit(0);
        }
        else
        {
            throw (e);
        }
    }

    return ret;
}

export const BattlePokedex: PokedexData = get("pokedex");
export const PokemonArray = get("pokemonarray");
export const BattleAbilities = get("abilities");
export const AbilityArray = get("abilityarray");
export const BattleMovedex = get("moves");
export const MoveArray = get("movearray");
export const BattleItems = get("items");
export const ItemArray = get("itemarray");
export const VolatileStatusArray = get("volatilestatusarray");
export const TypeArray = get("typearray");
export const BattleLearnsets = get("learnsets");

export const NUM_MOVES = MoveArray.length - 1;
export const NUM_NON_VOLATIVE_STATUSES = 7;
export const NUM_VOLATILE_STATUSES = VolatileStatusArray.length;
export const NUM_TYPES = TypeArray.length - 1;
export const NUM_ITEMS = ItemArray.length - 1;
export const NUM_ABILITIES = AbilityArray.length - 1;
export const NUM_POKEMON = PokemonArray.length - 1;