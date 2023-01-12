# Neko Airdrop
Tool support airdrop token

TS OR RUST
======
  <!--ts-->
   * [Typescript](#typescript)
   * [Rust](#rust)

<!--te-->

  

# Typescript
  ## Install
      cd airdrop-token/ts
      pnpm install
    
  Note:
    If you have Node 16+, you can [activate PNPM with Corepack](https://pnpm.io/installation#using-corepack):
    
      corepack enable
      corepack prepare pnpm@`npm info pnpm --json | jq -r .version` --activate

  ## Config
  
  Data follow by two [interface](https://github.com/neko-global/airdrop-token/blob/main/ts/src/types.ts#L15-L23)

  ### Airdrop Nft
  
  Data `nft.json`
  ```json
      [
        {
          "address": "ykkvsfEtAhc7faxK3uJTYMPBmtrisGkU9Kv4SnuxzB7",
          "mint": "ECqcdc38PNdwfS2ZbszgWtgndN57v319WcHZ8Vo1oEtA"
        },
        {
          "address": "ykkvsfEtAhc7faxK3uJTYMPBmtrisGkU9Kv4SnuxzB7",
          "mint": "AUXfX7Gpfe6RathfCwE1tQz337NYW9Ft2WkUYRvwxi5Y"
        }
      ]
  ```
  
  Config .env example
  ```
    PRIVATE_KEY_PATH=./key.json
    RPC_URL=https://api.devnet.solana.com
    AIRDROP_DATA=./nft.json
    TOKEN_TYPE=nft
  ```
    
  ### Airdrop Token
  Data `token.json`
  ```json
    [
      {
        "address": "9R9DPnB5hxaaHKnizjc1MAF4vP37aiZjyt1gH6jqUcZy",
        "amount": 1
      },
      {
        "address": "9R9DPnB5hxaaHKnizjc1MAF4vP37aiZjyt1gH6jqUcZy",
        "amount": 1
      }
    ]
  ```
  
  Config .env example
  ```
    PRIVATE_KEY_PATH=./key.json
    MINT_ADDRESS=5quNTYyxJAuWa16U8DPmc7NtJMN1jBnDxNpC5NSB1AAL
    RPC_URL=https://api.devnet.solana.com
    AIRDROP_DATA=./token.json
    TOKEN_TYPE=token
  ```
    
      
  ## Run
  ```bash
    npx ts-node src/main.ts
  ```
  
# Rust
  - TODO
