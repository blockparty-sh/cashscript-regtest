import { BITBOX } from 'bitbox-sdk';
import { stringify } from '@bitauth/libauth';
import BitcoinRpcNetworkProvider from './BitcoinRpcNetworkProvider';
import {
  Contract,
  SignatureTemplate,
  CashCompiler,
} from 'cashscript';
import path from 'path';

const bitbox = new BITBOX();
const rpcUrl = 'http://bitcoin:password@0.0.0.0:18444';

async function run(): Promise<void> {

  // Compile the P2PKH contract to an artifact object
  const artifact = CashCompiler.compileFile(path.join(__dirname, 'p2pkh.cash'));

  // Initialise a network provider for network operations on REGTEST
  const provider = new BitcoinRpcNetworkProvider('regtest', rpcUrl, { maxRetries: 0 });

  // get regtest rpc instance for creating new addresses, coins
  const rpc = provider.getClient();


  // we need to generate a new address for alice
  // we can get a new one from rpc, or import one like shown below for contract
  const address = await rpc.getNewAddress();
  const wif = await rpc.dumpPrivKey(address);

  // alice's keypair
  const alice = bitbox.ECPair.fromWIF(wif);

  // Derive alice's public key and public key hash
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const alicePkh = bitbox.Crypto.hash160(alicePk);

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const contract = new Contract(artifact, [alicePkh], provider);

  // fund contract with fresh coin
  // you must import any address prior to sending it coins, so it may track the utxos
  await rpc.importAddress(contract.address, "contract", true, false);
  // make sure to use 101 (or higher if needed) for the 100 block maturation time rule
  await rpc.generateToAddress(101, contract.address);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the spend() function with alice's signature + pk
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const tx = await contract.functions
    .spend(alicePk, new SignatureTemplate(alice))
    .to(contract.address, 10000)
    .send();

  console.log('transaction details:', stringify(tx));

  // Call the spend() function with alice's signature + pk
  // And use it to send two outputs of 0. 000 150 00 BCH back to the contract's address
  const tx2 = await contract.functions
    .spend(alicePk, new SignatureTemplate(alice))
    .to(contract.address, 15000)
    .to(contract.address, 15000)
    .send();

  console.log('transaction details:', stringify(tx2));
}

run();
