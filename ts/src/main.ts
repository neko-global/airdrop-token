import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { config } from "dotenv";
import { airdropNft } from "./nft";
import { airdropToken } from "./token";
import { TokenType } from "./types";
import { loadKeyPair } from "./utils";

(async () => {
  // validate .env
  config({ path: "../.env" });
  // if (parsed) {
  //   Object.keys(parsed).forEach((key) => {
  //     if (!parsed[key]) {
  //       throw new Error(`Missing ${key} value in .env`);
  //     }
  //   });
  // } else {
  //   throw new Error(`Error .env parsing`);
  // }

  const connection = new Connection(process.env.RPC_URL!);
  const receivers = require(process.env.AIRDROP_DATA!);
  const keypair = loadKeyPair(process.env.PRIVATE_KEY!);

  let tokenType: TokenType;
  if (process.env.TOKEN_TYPE == "token") {
    tokenType = TokenType.TOKEN;
  } else if (process.env.TOKEN_TYPE == "nft") {
    tokenType = TokenType.NFT;
  } else {
    throw new Error(
      `Missing token type: TOKEN_TYPE accept value: "token" or "nft"`
    );
  }

  if (tokenType == TokenType.TOKEN) {
    const mintAddress = new PublicKey(process.env.MINT_ADDRESS!);
    await airdropToken(connection, receivers, mintAddress, keypair);
  } else {
    await airdropNft(connection, receivers, keypair);
  }
})();
