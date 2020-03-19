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
                
            }
            case "-status":
            {
                // pokemon|status
            }
            case "-curestatus":
            {
                // pokemon|status
            }
            case "-cureteam":
            {
                // pokemon
            }
            case "-boost":
            {
                // pokemon|stat|amt
            }
            case "-unboost":
            {
                // pokemon|stat|amt
            }
            case "-setboost":
            {
                // pokemon|stat|stage
                
            }
            case "-swapboost":
            {
                // source|target|comma separated list of stats being swapped
                
            }
            case "-invertboost":
            {
                // pokemon 
                
            }
            case "-clearboost":
            {
                // pokemon
                
            }
            case "-clearallboost":
            {
                // nothing!
                
            }
            case "-clearpositiveboost":
            {
                // target|pokemon|effect
                
            }
            case "-clearnegativeboost":
            {
                // pokemon
                
            }
            case "-copyboost":
            {
                // source|target
                
            }
            case "-weather":
            {
                // weather
                
            }
            case "-fieldstart":
            {
                // condition (field condition has started)
                
            }
            case "-fieldend":
            {
                // condition (field condition has ended)
                
            }
            case "-sidestart":
            {
                // side|condition
                
            }
            case "-sideend":
            {
                // side|condition
                
            }
            case "-start": // dumb name
            {
                // pokemon|volatilestatus
                
            }
            case "-end": // dumb name
            {
                // pokemon|volatilestatus
                
            }
            case "-item":
            {
                // pokemon|item|effect
                
            }
            case "-enditem":
            {
                // pokemon|item|effect
                
            }
            case "-ability":
            {
                // pokemon|ability|effect
                
            }
            case "-endability":
            {
                // pokemon
                
            }
            case "-transform":
            {
                // pokemon|species
                
            }
            case "-activate":
            {
                // effect
                
            }
            case "turn": 
            {
                // just gonna be a number :)
                
            }
            case "move":
            {
                // like : |move|p1a: Keldeo|Secret Sword|p2a: Mandibuzz
                
                
            }
            case "-prepare":
            {
                // attaker|move|defender
                
            }
            case "-mustrecharge":
            {
                // pokemon
                
            }
            case "-singlemove":
            {
                // pokemon|move
                
            }
            case "-singleturn":
            {
                // pokemon|move
                
            }
            case "switch":
            case "drag":
            {
                // pokemon|details|hp + status
                
            }
            case "detailschange":
            case "-formechange":
            case "replace":
            {
                // pokemon|new species|hp + status
                
            }
            case "faint":
            {
                // pokemon
                
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