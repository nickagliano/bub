# bub
battle ultra bot

## setup
first u should create config file called `bub.json` in the root directory of the repo
this should have the following format:
```
{
    "username": "username here",
    "password": "password here"
}
```
then u can do the following:
* run `npm install`
* run `npm run fetchdata` to fetch pokemon/move/ability/etc data that bub requires
* run `npm run build:watch` in one terminal (will build and watch for changes)
* run `npm start` in another terminal to actually start B.U.B.