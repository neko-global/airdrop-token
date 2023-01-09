import { PublicKey } from "@solana/web3.js";

export type TransferTokenOrder = {
  from: PublicKey;
  to: PublicKey;
  amount: number;
};

export type TransferNftOrder = {
  from: PublicKey;
  to: PublicKey;
  mintAddress: PublicKey;
};

export interface TransferTokenData {
  address: string;
  amount: number;
}

export interface TransferNftData {
  address: string;
  mint: string;
}

export enum TokenType {
  TOKEN,
  NFT,
}
