// credits; https://github.com/Ecuacion/Pokemon-Showdown-Node-Bot/blob/master/showdown-client.js

import * as WebSocket from "ws";
import * as https from "https";
import * as fs from "fs";
import * as url from "url";
import { Config } from "./types";

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

    constructor(config: Config, onconnect: () => any)
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
    }

    private log(msg: string): void
    {
        this.logStream.write(msg);
    }

    private sanitizeName(text: string): string
    {
        return text.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    public write(message: string): void
    {
        console.log("sending: " + message);
        this.socket.send(message);
    }

    public findBattle(): void
    {
        this.write("/battle!");
    }

    private handleMessage(roomId: string, tokens: string[]): void
    {
        switch (tokens[0])
        {
            case "challstr": // TODO: handle failed login better
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
    
                            this.write("|/trn " + this.sanitizeName(this.config.username) + ",300," + assertion);
                            this.write("|/avatar 120");
                        });
                    }
                );
    
                req.on("error", (e) =>
                {
                    console.log("error logging in - " + e.message);
                });
    
                req.write(data);
                req.end();
                break;
            }
            case "updateuser":
            {
                if (!this.receivedAck && tokens[1].substr(1) === this.sanitizeName(this.config.username))
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
    
                    if (data.forceSwitch)
                    {
                        // switch //
                        const pokemon = data.side.pokemon;
                        const switchTo = pokemon.findIndex(p => p.condition !== "0 fnt" && p.active === false) + 1;
                        this.write(roomId + "|/switch " + switchTo.toString());
                    }
                    else if (data.active)
                    {
                        // pick move //
                        const numMoves = data.active[0].moves.length;
                        const pick = Math.floor(Math.random() * numMoves) + 1;
                        this.write(roomId + "|/move " + pick.toString());
                    }
                    else
                    {
                        console.error("weird request", data);
                    }
                }

                break;
            }
        }
    }
}