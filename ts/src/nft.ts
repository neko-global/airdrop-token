import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { TransferNftData, TransferNftOrder } from "./types";
import { transferNft, writeLog } from "./utils";

export async function airdropNft(
  connection: Connection,
  receivers: TransferNftData[],
  keypair: Keypair
): Promise<void> {
  const solBalance =
    (await connection.getBalance(keypair.publicKey)) / LAMPORTS_PER_SOL;
  const estimateFee = receivers.length * 0.002;
  if (solBalance < estimateFee) {
    console.warn(
      `Currently SOL balance maybe not enough to execute all airdrop transactions`
    );
  }
  process.stdout.write(`\x1b[33m Receivers: ${receivers.length} \x1b[1m`);
  process.stdout.write(`\x1b[33m Estimate Fee: ${estimateFee} SOL \x1b[1m`);

  console.log();
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log();

  const success: any = [];
  const errors: any = [];

  for (const receiver of receivers) {
    try {
      const order: TransferNftOrder = {
        from: keypair.publicKey,
        to: new PublicKey(receiver.address),
        mintAddress: new PublicKey(receiver.mint),
      };
      const signature = await transferNft(connection, order, keypair);
      success.push({
        receiver: receiver.address,
        mint: receiver.mint,
        signature: signature,
        time: new Date().toLocaleString(),
      });
    } catch (error: any) {
      errors.push({
        receiver: receiver.address,
        mint: receiver.mint,
        error: error.toString(),
        time: new Date().toLocaleString(),
      });
    }

    process.stdout.write(
      `AIRDROP NFT: \x1b[32m ✅: ${success.length} ( ${Math.floor(
        (success.length / receivers.length) * 100
      )} %) - 🐛: ${errors.length} ( ${Math.floor(
        (errors.length / receivers.length) * 100
      )} %) - 🚀 ${Math.floor(
        ((success.length + errors.length) / receivers.length) * 100
      )} % \r \x1b[1m`
    );
  }
  // logging
  writeLog("./logs/nft", success, errors);
}
