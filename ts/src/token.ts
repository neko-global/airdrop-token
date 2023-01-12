import { getMint } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { TransferTokenOrder, TransferTokenData } from "./types";
import { getTokenBalance, transferToken, writeLog } from "./utils";

export async function airdropToken(
  connection: Connection,
  receivers: TransferTokenData[],
  mintAddress: PublicKey,
  keypair: Keypair
): Promise<void> {
  const decimals = (await getMint(connection, mintAddress)).decimals;
  const solBalance =
    (await connection.getBalance(keypair.publicKey)) / LAMPORTS_PER_SOL;
  const tokenBalance = await getTokenBalance(
    connection,
    keypair.publicKey,
    mintAddress,
    decimals
  );
  let totalTokenAmount = 0;
  receivers.filter((item) => (totalTokenAmount += item.amount));
  const estimateFee = receivers.length * 0.001;
  if (solBalance < estimateFee) {
    console.warn(
      `Currently SOL balance maybe not enough to execute all airdrop transactions`
    );
  }

  if (tokenBalance < totalTokenAmount) {
    console.warn(
      `Currently Token balance maybe not enough to execute all airdrop transactions`
    );
  }

  process.stdout.write(`\x1b[33m Receivers: ${receivers.length} \x1b[1m`);
  process.stdout.write(`\x1b[33m Total Amount: ${totalTokenAmount} \x1b[1m`);
  process.stdout.write(`\x1b[33m Current Balance: ${tokenBalance} \x1b[1m`);
  process.stdout.write(`\x1b[33m Estimate Fee: ${estimateFee} SOL \x1b[1m`);

  console.log();
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log();
  
  const success: any = [];
  const errors: any = [];

  for (const receiver of receivers) {
    try {
      const order: TransferTokenOrder = {
        from: keypair.publicKey,
        to: new PublicKey(receiver.address),
        amount: receiver.amount,
      };
      const signature = await transferToken(
        connection,
        order,
        mintAddress,
        keypair,
        decimals
      );
      success.push({
        receiver: receiver.address,
        amount: receiver.amount,
        signature: signature,
        time: new Date().toLocaleString(),
      });
    } catch (error: any) {
      errors.push({
        receiver: receiver.address,
        amount: receiver.amount,
        error: error.toString(),
        time: new Date().toLocaleString(),
      });
    }
    process.stdout.write(
      `AIRDROP TOKEN: \x1b[32m ✅: ${success.length} ( ${Math.floor(
        (success.length / receivers.length) * 100
      )} %) - 🐛: ${errors.length} ( ${Math.floor(
        (errors.length / receivers.length) * 100
      )} %) - 🚀 ${Math.floor(
        ((success.length + errors.length) / receivers.length) * 100
      )} % \r \x1b[1m`
    );
  }

  // logging
  writeLog("./logs/token", success, errors);
}
