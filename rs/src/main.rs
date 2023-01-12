use dotenv::dotenv;

fn main() {
    println!("Hello, world!");
    dotenv().ok();
    let private_key = std::env::var("PRIVATE_KEY_PATH").expect("PRIVATE_KEY_PATH must be set.");
    let rpc_url = std::env::var("RPC_URL").expect("RPC_URL must be set.");
    let airdrop_data = std::env::var("AIRDROP_DATA").expect("AIRDROP_DATA must be set.");
    let token_type = std::env::var("TOKEN_TYPE").expect("TOKEN_TYPE must be set (nft | token).");

    println!("private: {}", private_key);
    println!("rpc: {}", rpc_url);
    println!("data: {}", airdrop_data);
    println!("token type: {}", token_type);

}