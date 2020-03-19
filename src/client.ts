// credits; https://github.com/Ecuacion/Pokemon-Showdown-Node-Bot/blob/master/showdown-client.js

import * as WebSocket from "ws";
import * as https from "https";
import * as fs from "fs";
import * as url from "url";
import { Config } from "./datatypes";
import StateBuilder, { BUBState, TranslatedBubState } from "./statebuilder";

export default class Client
{
    private config: Config;
    private socketAddr = "ws://sim.smogon.com:8000/showdown/websocket";
    private actionAddr = "https://play.pokemonshowdown.com/~~showdown/action.php";
    private challstr = {
        id: "",
        str: ""
    };
    private socket: WebSocket;
    private onconnect: () => any;
    private receivedAck = false;
    private logStream: fs.WriteStream;
    private states: Map<string, StateBuilder> = new Map();
    private messageQueue: string[] = [];

    constructor(config: Config, onconnect: () => any, private writeToBub: (obj: string) => any)
    {
        // set up logging //
        this.logStream = fs.createWriteStream("log.txt", { flags: "a", encoding: "utf8" });

        // set up client //
        this.config = config;
        this.onconnect = onconnect;
        this.socket = new WebSocket(this.socketAddr);

        this.socket.on("message", (_data) =>
        {
            const data = _data.toString().trim();
            console.log("received: ", data);
        
            if (data.length > 0 && data[0] === "|")
            {
                const tokens = data.toString().substr(1).split("|");
                this.handleMessage("", tokens);
            }
            else if (data.length > 0 && data[0] === ">")
            {
                const lines = data.split("\n");
                const roomId = lines.splice(0, 1)[0].substr(1);
                lines.forEach((line) =>
                {
                    if (line.startsWith("|"))
                    {
                        this.handleMessage(roomId, line.substr(1).split("|"));
                    }
                });
            }
        });

        setInterval(() =>
        {
            if (this.messageQueue.length > 0)
            {
                const message = this.messageQueue.shift();
                console.log("sending to showdown: " + message);
                this.socket.send(message);
            }
        }, 1000);
    }

    private log(msg: string): void
    {
        this.logStream.write(msg);
    }

    private sanitizeName(text: string): string
    {
        return text.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    public writeRaw(message: string): void
    {
        this.messageQueue.push(message);
    }

    public writeToRoom(roomId: string, message: string): void
    {
        this.writeRaw(roomId + "|" + message);
    }

    public writeGlobal(message: string): void
    {
        this.writeRaw("|" + message);
    }

    public findBattle(): void
    {
        this.writeRaw("/battle!");
    }

    private handleMessage(roomId: string, tokens: string[]): void
    {
        switch (tokens[0])
        {
            case "challstr":
            {
                this.respondToChallStr(tokens);
                break;
            }
            case "updateuser":
            {
                if (!this.receivedAck && this.sanitizeName(tokens[1].substr(1)) === this.sanitizeName(this.config.username))
                {
                    this.receivedAck = true;
                    this.onconnect();
                }
                break;
            }
            case "request":
            {
                if (tokens[1] && tokens[1].trim())
                {
                    const data = JSON.parse(tokens[1]);
    
                    if (data.teamPreview)
                    {
                        const newState = new StateBuilder();
                        newState.parseFirstRequest(data);
                        this.states.set(roomId, newState);
                    }
                    else if (data.forceSwitch)
                    {
                        this.writeToBub("state|" + roomId + "|" + this.states.get(roomId).getState().join(","));
                        
                        // switch //
                        // const pokemon = data.side.pokemon;
                        // const switchTo = pokemon.findIndex(p => p.condition !== "0 fnt" && p.active === false) + 1;
                        // this.writeRaw(roomId + "|/switch " + switchTo.toString());
                    }
                    else if (data.active)
                    {
                        console.log("sending state to lil bub")
                        this.writeToBub("state|" + roomId + "|" + this.states.get(roomId).getState().join(","));
                        // pick move //
                        // const numMoves = data.active[0].moves.length;
                        // const pick = Math.floor(Math.random() * numMoves) + 1;
                        // this.writeRaw(roomId + "|/move " + pick.toString());
                    }
                    else
                    {
                        console.error("weird request", data);
                    }
                }

                break;
            }
            case "poke":
            {
                this.states.get(roomId).parsePoke(tokens[1] as "p1" | "p2", tokens[2]);
                break;
            }
            case "clearpoke":
            {
                this.states.get(roomId).clearPoke();
                break;
            }
            case "teampreview":
            {
                this.writeToRoom(roomId, "/team 123456");
                break;
            }
            case "error":
            {
                if (tokens[1].startsWith("[Invalid choice]"))
                {
                    this.writeToBub("error|" + roomId + "|poo")
                }
                break;
            }
            case "win":
            {
                let winLoseString = "lose";

                if (this.sanitizeName(tokens[1]) === this.sanitizeName(this.config.username))
                {
                    winLoseString = "win";
                }

                this.writeToBub("done|" + roomId + "|" + winLoseString);
                break;
            }
            case "-damage":
            case "-heal":
            case "-sethp":
            {
                // pokemon|hp + status
                this.states.get(roomId).parseSetHp(tokens[2], tokens[3]);
                break;
            }
            case "-status":
            {
                // pokemon|status
                this.states.get(roomId).parseStatus(tokens[1], tokens[2]);
                break;
            }
            case "-curestatus":
            {
                // pokemon|status
                this.states.get(roomId).parseCureStatus(tokens[1], tokens[2]);
                break;
            }
            case "-cureteam":
            {
                // pokemon
                this.states.get(roomId).parseCureTeam(tokens[1]);
                break;
            }
            case "-boost":
            {
                // pokemon|stat|amt
                this.states.get(roomId).parseBoost(1, tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-unboost":
            {
                // pokemon|stat|amt
                this.states.get(roomId).parseBoost(-1, tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-setboost":
            {
                // pokemon|stat|stage
                this.states.get(roomId).parseSetBoost(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-swapboost":
            {
                // source|target|comma separated list of stats being swapped
                this.states.get(roomId).parseSwapBoost(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-invertboost":
            {
                // pokemon 
                this.states.get(roomId).parseInvertBoost(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-clearboost":
            {
                // pokemon
                this.states.get(roomId).parseClearBoost(tokens[1]);
                break;
            }
            case "-clearallboost":
            {
                // nothing!
                this.states.get(roomId).parseClearAllBoost();
                break;
            }
            case "-clearpositiveboost":
            {
                // target|pokemon|effect
                this.states.get(roomId).parseClearPositiveBoost(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-clearnegativeboost":
            {
                // pokemon
                this.states.get(roomId).parseNegativeBoost(tokens[1]);
                break;
            }
            case "-copyboost":
            {
                // source|target
                this.states.get(roomId).parseCopyBoost(tokens[1], tokens[2]);
                break;
            }
            case "-weather":
            {
                // weather
                this.states.get(roomId).parseWeather(tokens[1]);
                break;
            }
            case "-fieldstart":
            {
                // condition (field condition has started)
                this.states.get(roomId).parseFieldStart(tokens[1]);
                break;
            }
            case "-fieldend":
            {
                // condition (field condition has ended)
                this.states.get(roomId).parseFieldEnd(tokens[1]);
                break;
            }
            case "-sidestart":
            {
                // side|condition
                this.states.get(roomId).parseSideStart(tokens[1], tokens[2]);
                break;
            }
            case "-sideend":
            {
                // side|condition
                this.states.get(roomId).parseSideEnd(tokens[1], tokens[2]);
                break;
            }
            case "-start": // dumb name
            {
                // pokemon|volatilestatus
                this.states.get(roomId).parseStart(tokens[1], tokens[2]);
                break;
            }
            case "-end": // dumb name
            {
                // pokemon|volatilestatus
                this.states.get(roomId).parseEnd(tokens[1], tokens[2]);
                break;
            }
            case "-item":
            {
                // pokemon|item|effect
                this.states.get(roomId).parseStart(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-enditem":
            {
                // pokemon|item|effect
                this.states.get(roomId).parseEndItem(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-ability":
            {
                // pokemon|ability|effect
                this.states.get(roomId).parseAbility(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-endability":
            {
                // pokemon
                this.states.get(roomId).parseEndAbility(tokens[1]);
                break;
            }
            case "-transform":
            {
                // pokemon|species
                this.states.get(roomId).parseTransform(tokens[1], tokens[2]);
                break;
            }
            case "-activate":
            {
                // effect
                this.states.get(roomId).parseActivate(tokens[1]);
                break;
            }
            case "turn": 
            {
                // just gonna be a number :)
                this.states.get(roomId).parseTurn(tokens[1]);
                break;
            }
            case "move":
            {
                // attacker|move|defender
                this.states.get(roomId).parseMove(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-prepare":
            {
                // attaker|move|defender
                this.states.get(roomId).parsePrepare(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "-mustrecharge":
            {
                // pokemon
                this.states.get(roomId).parseMustRecharge(tokens[1]);
                break;
            }
            case "-singlemove":
            {
                // pokemon|move
                this.states.get(roomId).parseSingleMove(tokens[1], tokens[2]);
                break;
            }
            case "-singleturn":
            {
                // pokemon|move
                this.states.get(roomId).parseSingleTurn(tokens[1], tokens[2]);
                break;
            }
            case "switch":
            case "drag":
            {
                // pokemon|details|hp + status
                this.states.get(roomId).parseSwitch(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "detailschange":
            case "-formechange":
            case "replace":
            {
                // pokemon|new species|hp + status
                this.states.get(roomId).parseDetailsChange(tokens[1], tokens[2], tokens[3]);
                break;
            }
            case "faint":
            {
                // pokemon
                this.states.get(roomId).parseFaint(tokens[1]);
                break;
            }
        }
    }

    private respondToChallStr(tokens: string[]) // TODO: handle failed login better
    {
        this.challstr = {
            id: tokens[1],
            str: tokens[2]
        };

        const data = "act=login&name=" + this.sanitizeName(this.config.username) +
            "&pass=" + this.config.password +
            "&challengekeyid=" + this.challstr.id +
            "&challenge=" + this.challstr.str;

        console.log("logging in as " + this.sanitizeName(this.config.username));

        const urlData = url.parse(this.actionAddr);

        const req = https.request(
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": data.length
                },
                method: "POST",
                hostname: urlData.hostname,
                port: urlData.port,
                path: urlData.path,
                agent: false
            },
            (res) =>
            {
                res.setEncoding("utf8");
                let data: any = "";
                res.on("data", d => data += d);
                res.on("end", () =>
                {
                    if (data === ";")
                    {
                        console.log("cant log in");
                        return;
                    }
                    else if (data.length < 50)
                    {
                        console.log("cant log in 2");
                        return;
                    }
                    else if (data.indexOf("heavy load") !== -1)
                    {
                        console.log("cant log in - heavy load");
                        return;
                    }
                    
                    //console.log(data);
                    
                    data = JSON.parse(data.substr(1));
                    let assertion: string;
                    if (data.actionsuccess)
                    {
                        assertion = data.assertion;
                    }
                    else
                    {
                        console.log("cant log in - ", data);
                        return;
                    }

                    this.writeGlobal("/trn " + this.sanitizeName(this.config.username) + ",300," + assertion);
                    this.writeGlobal("/avatar 120");
                });
            }
        );

        req.on("error", (e) =>
        {
            console.log("error logging in - " + e.message);
        });

        req.write(data);
        req.end();
    }
}