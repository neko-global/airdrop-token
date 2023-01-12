import {
  PublicKey,
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import fs from "fs";
import {
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import { formatUnits, parseUnits } from "@ethersproject/units";
import {
  TransferTokenOrder,
  TransferNftOrder,
  TransferTokenData,
  TokenType,
  TransferNftData,
} from "./types";

export function checkAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function validAddress(
  data: TransferTokenData[] | TransferNftData[]
): void {
  process.stdout.write(`\x1b[31m Total check ${data.length} addresses \x1b[1m \n`);
  const errors: string[] = [];
  data.forEach((item) => {
    if (!checkAddress(item.address)) {
      errors.push(item.address);
    }
  });

  if (errors.length > 0) {
    process.stdout.write(`\x1b[31m ${errors.length} Errors \x1b[1m \n`);
    process.stdout.write(`\x1b[31m Errors address: ${errors} \x1b[1m \n`);
    throw new Error(`Address Error: Some address invalid`);
  }

  process.stdout.write(`\x1b[32m ${data.length} addresses valid \x1b[1m \n`);
}

export async function getTokenBalance(
  connection: Connection,
  wallet: PublicKey,
  mintAddress: PublicKey,
  decimals: number
): Promise<Number> {
  const tokenAccount = await getAssociatedTokenAddress(mintAddress, wallet);
  const info = await getAccount(connection, tokenAccount);
  return Number(formatUnits(info.amount.toString(), decimals));
}

export function loadKeyPair(secretKeyPath: string): Keypair {
  return Keypair.fromSecretKey(
    new Uint8Array(require(secretKeyPath))
  ) as Keypair;
}

export function writeLog(path: string, success: any[], errors: any[]): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  const date = new Date();

  if (success.length > 0) {
    fs.writeFile(
      `${path}/success_${date.toLocaleTimeString()}.json`,
      JSON.stringify(success),
      () => {
        console.log("write success log");
      }
    );
  }

  if (errors.length > 0) {
    fs.writeFile(
      `${path}/errors_${date.toLocaleTimeString()}.json`,
      JSON.stringify(errors),
      () => {
        console.log("write errors log");
      }
    );
  }
}

export function validateJsonData(data: any[], tokenType: TokenType): boolean {
  let result: boolean = true;
  switch (tokenType) {
    case TokenType.TOKEN: {
      data.forEach((value) => {
        if (
          typeof value.address !== "string" ||
          typeof value.amount !== "number"
        ) {
          result = false;
          return;
        }
      });
      break;
    }
    case TokenType.NFT: {
      data.forEach((value) => {
        if (
          typeof value.address !== "string" ||
          typeof value.mint !== "string"
        ) {
          result = false;
          return;
        }
      });
      break;
    }
    default: {
      throw new Error("Invalid token type");
    }
  }

  return result;
}

/**
 *
 * @param connection Solana web3 connection
 * @param order see @types TransferOrder
 * @param mintAddress
 * @param keypair
 * @param decimals
 * @returns
 */
export async function transferToken(
  connection: Connection,
  order: TransferTokenOrder,
  mintAddress: PublicKey,
  keypair: Keypair,
  decimals: number
): Promise<string> {
  const [fromAssociatedTokenAccount, toAssociatedTokenAccount] =
    await Promise.all([
      getAssociatedTokenAddress(mintAddress, order.from),
      getAssociatedTokenAddress(mintAddress, order.to),
    ]);
  const amountRaw = parseUnits(order.amount.toString(), decimals).toNumber();

  // create if associate_token_account's receiver is not exist
  const info = await connection.getParsedAccountInfo(toAssociatedTokenAccount);
  const associatedAcccountInstruction: TransactionInstruction[] = [];
  if (!info.value) {
    const ins = createAssociatedTokenAccountInstruction(
      order.to,
      toAssociatedTokenAccount,
      order.to,
      mintAddress
    );
    associatedAcccountInstruction.push(ins);
  }
  const transferTokenRawInstruction = createTransferCheckedInstruction(
    fromAssociatedTokenAccount,
    mintAddress,
    toAssociatedTokenAccount,
    keypair.publicKey,
    amountRaw,
    decimals
  );
  //
  const instructions = [
    ...associatedAcccountInstruction,
    transferTokenRawInstruction,
  ];

  //
  const tx = new Transaction().add(...instructions);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(keypair);
  const signature = await connection.sendRawTransaction(tx.serialize());
  return signature;
}

/**
 *
 * @param connection Solana web3 connection
 * @param order @types TransferOrder
 * @param mintAddress NFT mint address
 * @param keypair keypair wallet
 * @returns  signature's transaction
 */
export async function transferNft(
  connection: Connection,
  order: TransferNftOrder,
  keypair: Keypair
): Promise<string> {
  const accounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(order.from),
    { mint: order.mintAddress }
  );
  const senderTokenAccount = accounts.value.filter(
    (item: any) => item.account.data.parsed.info.tokenAmount.uiAmount > 0
  )[0];

  if (!senderTokenAccount) {
    throw new Error(
      `Not found account of ${order.from.toString()} for token ${order.mintAddress.toString()}`
    );
  }
  ///
  // Get the derived address of the destination wallet which will hold the custom token
  const toAssociatedTokenAccount = await getAssociatedTokenAddress(
    order.mintAddress,
    order.to,
    true
  );

  const info = await connection.getParsedAccountInfo(toAssociatedTokenAccount);
  const associatedAcccountInstruction: TransactionInstruction[] = [];
  if (!info.value) {
    associatedAcccountInstruction.push(
      createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        toAssociatedTokenAccount,
        order.to,
        order.mintAddress
      )
    );
  }

  const transferCheckedInstruction = createTransferCheckedInstruction(
    senderTokenAccount.pubkey,
    order.mintAddress,
    toAssociatedTokenAccount,
    keypair.publicKey,
    1, // amount nft = 1
    0 // decimal = 0
  );

  const instructions = [
    ...associatedAcccountInstruction,
    transferCheckedInstruction,
  ];
  const tx = new Transaction().add(...instructions);

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  // sign transaction
  tx.sign(keypair);
  const signature = connection.sendRawTransaction(tx.serialize());
  return signature;
}
