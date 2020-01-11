import sys
import json
import asyncio


if __name__ == "__main__":
    while True:
        msg = json.loads(input())
        print("bub: " + msg)
		
		
# example async function
async def anAsyncFunction(delay):
    loop = asyncio.get_running_loop()
    end_time = loop.time() + delay
    while True:
        print("Blocking...")
        await asyncio.sleep(1)
        if loop.time() > end_time:
            print("Done.")
            break

async def main():
    await anAsyncFunction(3.0)

asyncio.run(main())