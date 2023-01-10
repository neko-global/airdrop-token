import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { config } from "dotenv";
import { airdropNft } from "./nft";
import { airdropToken } from "./token";
import { TokenType, TransferNftData, TransferTokenData } from "./types";
import { loadKeyPair, validateJsonData } from "./utils";

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
  const receivers: any[] = require(process.env.AIRDROP_DATA!);
  const keypair = loadKeyPair(process.env.PRIVATE_KEY_PATH!);

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
    if (process.env.MINT_ADDRESS) {
      const mintAddress = new PublicKey(process.env.MINT_ADDRESS);
      // validate data
      const isValidJson = validateJsonData(receivers, TokenType.TOKEN);
      if (!isValidJson) {
        throw new Error(`Data receiver invalid format with airdrop token`);
      }
      // 
      await airdropToken(connection, receivers, mintAddress, keypair);
    } else {
      throw new Error(`Missing mint token. Please setting in .env`);
    }
  } else {
    const isValidJson = validateJsonData(receivers, TokenType.NFT);
    if (!isValidJson) {
      throw new Error(`Data receiver invalid format with airdrop nft`);
    }
    await airdropNft(connection, receivers, keypair);
  }
})();
