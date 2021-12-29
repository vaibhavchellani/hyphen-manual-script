# Hyphen Force Push

Automating hyphen tx execution

```
npm i
cp .env.example .env
```

Fill up our RPCs in the env

```
source .env
npm run pm2:start
```

you can now see the logs by running the cmd below 

```
npx pm2 log index
```

you can stop the pm2 process by running the below

```
npm run pm2:stop
```
