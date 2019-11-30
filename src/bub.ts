// credits; https://github.com/Ecuacion/Pokemon-Showdown-Node-Bot/blob/master/showdown-client.js

import * as WebSocket from "ws";
import * as fs from "fs";
import * as https from "https";
import * as url from "url";

const config = JSON.parse(fs.readFileSync("./bub.json", "utf8"));
//console.log("username: " + config.username + "\npassword: " + config.password);

const socketAddr = "ws://sim.smogon.com:8000/showdown/websocket";
const actionAddr = "https://play.pokemonshowdown.com/~~showdown/action.php";
let challstr = {
    id: "",
    str: ""
};

const client = new WebSocket(socketAddr);
client.on("message", (data) =>
{
    console.log("received: ", data);

    const tokens = data.toString().substr(1).split("|");
    handleMessage(tokens);
});

function handleMessage(tokens: string[])
{
    switch (tokens[0])
    {
        case "challstr":
        {
            challstr = {
                id: tokens[1],
                str: tokens[2]
            };

            const data = "act=login&name=" + sanitizeName(config.username) + "&pass=" + config.password + "&challengekeyid=" + challstr.id + "&challenge=" + challstr.str;
            const urlData = url.parse(actionAddr);

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
                        
                        console.log(data);
                        
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

                        client.send("|/trn " + sanitizeName(config.username) + ",23," + assertion);
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
    }
}

function sanitizeName(text: string)
{
	return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}