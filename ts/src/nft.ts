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
  if (solBalance < receivers.length * 0.0001) {
    console.warn(
      `Currently SOL balance maybe not enough to execute all airdrop transactions`
    );
  }

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
        signature: signature,
        time: new Date().toUTCString(),
      });
    } catch (error: any) {
      errors.push({
        receiver: receiver.address,
        error: error.toString(),
        time: new Date().toUTCString(),
      });
    }

    console.log(
      `Success: ${success.length} - Error: ${
        errors.length
      } - Loading: ${Math.floor(
        ((success.length + errors.length) / receivers.length) * 100
      )} %`
    );
  }
  // logging
  writeLog("./logs/nft", success, errors);
}
