// this script is UNSAFE!!! it blindly executes the contents of showdown repo files - if those r compromised, running this script will give them access to ur computer - this is HIGHLY UNLIKELY to happen but FAIR WARNING... //

const https = require("https");
const fs = require("fs");
const vm = require("vm");

async function fetchFile(url)
{
    return new Promise((resolve, reject) =>
    {
        https.get(url).on("response", (response) =>
        {
            let body = "";
            response.on("data", (chunk) =>
            {
                body += chunk;
            });
        
            response.on("end", () =>
            {
                resolve(body);
            });
        });
    });
}

async function getObjectFromFile(url)
{
    let str = await fetchFile(url);
    str = str.substr(str.indexOf("let ") + 4);
    str = str.substr(0, str.indexOf("\nexports."));
    const script = new vm.Script(str);
    const context = vm.createContext();
    const ret = script.runInContext(context);
    return ret;
}

async function fetchPokedex()
{
    const BattlePokedex = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/pokedex.js")

    const wantedMembers = [
        "num",
        "species",
        "types",
        "baseStats",
        "abilities",
        "gender",
        "heightm",
        "weightkg",
        "color",
        "evos",
        "baseSpecies",
        "forme",
        "baseForme",
        "otherFormes",
        "inheritsFrom"
    ];

    for (const pokemon in BattlePokedex)
    {
        for (const key in BattlePokedex[pokemon])
        {
            if (!wantedMembers.includes(key))
            {
                delete BattlePokedex[pokemon][key];
            }
        }
    }
    
    const toSave = JSON.stringify(BattlePokedex);
    fs.writeFileSync("data/pokedex.json", toSave);

    const array = Object.keys(BattlePokedex);
    if (array[0] !== "nopokemon")
    {
        array.unshift("nopokemon");
    }
    fs.writeFileSync("data/pokemonarray.json", JSON.stringify(array));
    console.log("fetched pokemon");
}

async function fetchAbilities()
{
    const abilities = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/abilities.js");
    fs.writeFileSync("data/abilities.json", JSON.stringify(abilities));
    const array = Object.keys(abilities);
    if (array[0] !== "noability")
    {
        array.unshift("noability");
    }
    fs.writeFileSync("data/abilityarray.json", JSON.stringify(array));
    console.log("fetched abilities");
}

async function fetchMoves()
{
    const moves = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/moves.js");
    fs.writeFileSync("data/moves.json", JSON.stringify(moves));
    const array = Object.keys(moves);
    if (array[0] !== "nomove")
    {
        array.unshift("nomove");
    }
    fs.writeFileSync("data/movearray.json", JSON.stringify(array));
    console.log("fetched moves");
    
    const x = moves;
    const statuses = new Set();

    const recurse = (move) =>
    {
        for (const innerKey in move)
        {
            if (innerKey === "volatileStatus")
            {
                statuses.add(move[innerKey]);
            }
            else if (typeof(move[innerKey]) === "object" && !Array.isArray(move[innerKey]))
            {
                recurse(move[innerKey]);
            }
        }
    };

    for (const key in x)
    {
        recurse(x[key]);
    }

    fs.writeFileSync("data/volatilestatusarray.json", JSON.stringify(Array.from(statuses)));
    console.log("fetched statuses");
}

async function fetchItems()
{
    const items = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/items.js");
    fs.writeFileSync("data/items.json", JSON.stringify(items));
    const array = Object.keys(items);
    if (array[0] !== "noitem")
    {
        array.unshift("noitem");
    }
    fs.writeFileSync("data/itemarray.json", JSON.stringify(array));
    console.log("fetched items");
}

async function fetchTypes()
{
    const types = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/typechart.js");
    const array = Object.keys(types).map(i => i.toLowerCase());
    if (array[0] !== "notype")
    {
        array.unshift("notype");
    }
    fs.writeFileSync("data/typearray.json", JSON.stringify(array));
    console.log("fetched types");
}

async function fetchLearnsets()
{
    const learnsets = await getObjectFromFile("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/learnsets.js");
    fs.writeFileSync("data/learnsets.json", JSON.stringify(learnsets));
    console.log("fetched learnsets");
}

async function fetchAll()
{
    fetchPokedex();
    fetchAbilities();
    fetchMoves();
    fetchItems();
    fetchTypes();
    fetchLearnsets();
}

try
{
    fs.mkdirSync("data");
}
catch (e)
{
    // we dont care if it already exists, but throw any other kind of error
    if (!(e.code && e.code === "EEXIST"))
    {
        throw e;
    }
}

fetchAll();