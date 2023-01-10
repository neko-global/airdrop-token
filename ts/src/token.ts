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
  const estimateFee = receivers.length * 0.0001;
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

  console.log(
    `Execute airdrop token: Total airdop amount: ${totalTokenAmount} - Token balance: ${tokenBalance} - Estimate Fee: ${estimateFee} SOL`
  );

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
        time: new Date().toUTCString(),
      });
    } catch (error: any) {
      errors.push({
        receiver: receiver.address,
        amount: receiver.amount,
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
  writeLog("./logs/token", success, errors);
}
