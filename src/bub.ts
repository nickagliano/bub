import * as fs from "fs";
import Client from "./client";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { StreamReader } from "./streamreader";

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let bub: ChildProcessWithoutNullStreams;

function writeToBub(obj: any)
{
    bub.stdin.write(JSON.stringify(obj));
}

let configStr: string;

try
{
    configStr = fs.readFileSync("./bub.json", "utf8");
}
catch (e)
{
    if (e.code && e.code === "ENOENT") // file not found
    {
        console.log("pls set up ur bub.json thx");
        process.exit();
    }
}

function handleBubTalk(data: string)
{
    // move|9403
    // switch|434
    // chat|jefiowjifeow

    const actionType = data.split("|")[0];
    const actionNum = parseInt(data.split("|")[1]);
}

const config = JSON.parse(configStr);
const client = new Client(config, init);
const reader = new StreamReader("/", handleBubTalk);

function init()
{
    console.log("============");
    bub = spawn("python", ["ai/bub.py"]);
    bub.stdin.setDefaultEncoding("utf8");
    bub.stdout.pipe(process.stdout);
    bub.stdout.addListener("data", reader.readChunk);
    bub.stdin.end();

    readline.on("line", (input) =>
    {
        console.log("sending: " + input);
        client.write(input);
    });
}