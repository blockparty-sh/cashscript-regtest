import { Utxo, Network, NetworkProvider } from 'cashscript';
import RpcClientRetry from 'bitcoin-rpc-promise-retry';

export default class BitcoinRpcNetworkProvider implements NetworkProvider {
  private rpcClient: RpcClientRetry;

  constructor(
    public network: Network,
    url: string,
    opts?: object,
  ) {
      this.rpcClient = new RpcClientRetry(url, opts);
  }

  async getUtxos(address: string): Promise<Utxo[]> {
	return (await this.rpcClient.listUnspent(0, 9999999, [ address ]))
        .map((u) => ({
            txid: u.txid,
            vout: u.vout,
            satoshis: u.amount * 100000000,
        }));
  }

  async getBlockHeight(): Promise<number> {
    return this.rpcClient.getBlockCount();
  }

  async getRawTransaction(txid: string): Promise<string> {
	return this.rpcClient.getRawTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
	return this.rpcClient.sendRawTransaction(txHex);
  }

  getClient(): RpcClientRetry {
      return this.rpcClient;
  }
}

interface ListUnspentItem {
    txid: string;
    vout: number;
    address: string;
    label: string;
    scriptPubKey: string;
    amount: number;
    confirmations: number;
    redeemScript: string;
    spendable: boolean;
    solvable: boolean;
    safe: boolean;
}

interface RpcClientRetry {
    constructor(url: string, opts?: object);
    listUnspent(minconf?: number, maxconf?: number, addresses?: string[], include_unsafe?: boolean, query_options?: object): Promise<ListUnspentItem[]>;
    getBlockCount(): Promise<number>;
    getRawTransaction(txid: string, verbose?: boolean, blockhash?: string): Promise<string>;
    sendRawTransaction(hexstring: string, allowhighfees?: boolean): Promise<string>;

    // below are not required for NetworkProvider interface
    generate(nblocks: number, maxtries?: number): Promise<string[]>;
    generateToAddress(nblocks: number, address: string, maxtries?: number): Promise<string[]>;
    getNewAddress(label?: string): Promise<string>;
    dumpPrivKey(address: string): Promise<string>;
    getBalance(dummy?: string, minconf?: number, include_watchonly?: boolean): Promise<number>;
    getBlock(blockhash: string, verbosity?: number): Promise<string>;
    importAddress(address: string, label?: string, rescan?: boolean, p2sh?: boolean): Promise<void>;
}
