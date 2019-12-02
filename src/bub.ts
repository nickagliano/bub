import * as fs from "fs";
import Client from "./client";
import { spawn, ChildProcessWithoutNullStreams } from "child_process"

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

const config = JSON.parse(configStr);
const client = new Client(config, init);

function init()
{
    console.log("============");
    bub = spawn("python", ["ai/bub.py"]);
    bub.stdin.setDefaultEncoding("utf8");
    bub.stdout.pipe(process.stdout);
    writeToBub("sup");
    bub.stdin.end();
}