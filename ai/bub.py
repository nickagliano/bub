import sys
import json
import asyncio


if __name__ == "__main__":
    while True:
        msg = json.loads(input())
        print("bub: " + msg)
		

#####################################################
# example async function?
async def get_state_loop(client, url):
	while True:
	    msg = await json.loads(input())
        print("bub: " + msg)
	return
		
asyncio.run(get_state_loop())