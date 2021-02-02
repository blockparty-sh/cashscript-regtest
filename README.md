# CashScript Regtest

An easy way to run CashScript programs using regtest mode.

## Getting Started

First, install dependencies:

```bash
yarn install
```

Next you need to start the sandboxed bitcoin regtest network described in `docker-compose.yml`.  This will create a bitcoin node which can be connected to via RPC. 

Start the regtest node:

```bash
docker-compose up -d
```

The `datadir` will be deleted when reset allowing you to have fresh blockchain easily. To reset, just close the running instances and start them again.

```bash
docker-compose down
```

Next you can run a CashScript program, p2pkh example is included:

```bash
npx ts-node cashscript/p2pkh.ts
```


## Thanks

To James Cramer for his Dockerfile base this is built on.
