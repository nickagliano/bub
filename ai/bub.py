import sys
import json

if __name__ == "__main__":
    while True:
        msg = json.loads(input())
        print("bub: " + msg)