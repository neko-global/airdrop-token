import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { config } from "dotenv";
import { airdropNft } from "./nft";
import { airdropToken } from "./token";
import { TokenType } from "./types";
import { loadKeyPair, validateJsonData } from "./utils";

(async () => {
  config({ path: "../.env" });

  const connection = new Connection(process.env.RPC_URL!);
  const receivers: any[] = require(process.env.AIRDROP_DATA!);
  const keypair = loadKeyPair(process.env.PRIVATE_KEY_PATH!);

  if (process.env.TOKEN_TYPE == "token") {
    if (process.env.MINT_ADDRESS) {
      const mintAddress = new PublicKey(process.env.MINT_ADDRESS);
      // validate data
      const isValidJson = validateJsonData(receivers, TokenType.TOKEN);
      if (!isValidJson) {
        throw new Error(`Data receiver invalid format with airdrop token`);
      }

      // execuate airdrop
      await airdropToken(connection, receivers, mintAddress, keypair);
    } else {
      throw new Error(`Missing mint token. Please setting in .env`);
    }
  } else if (process.env.TOKEN_TYPE == "nft") {
    const isValidJson = validateJsonData(receivers, TokenType.NFT);
    if (!isValidJson) {
      throw new Error(`Data receiver invalid format with airdrop nft`);
    }

    // execute airdrop
    await airdropNft(connection, receivers, keypair);
  } else {
    throw new Error(
      `Missing token type: TOKEN_TYPE accept value: "token" or "nft"`
    );
  }
})();
