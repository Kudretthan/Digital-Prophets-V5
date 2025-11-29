#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec, Map};

#[contract]
pub struct PredictionMarket;

#[contractimpl]
impl PredictionMarket {
    /// Initialize contract with xlm token and admin
    pub fn initialize(env: Env, token: Address, admin: Address) {
        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "token"), &token);
        storage.set(&Symbol::new(&env, "admin"), &admin);
        storage.set(&Symbol::new(&env, "next_prediction_id"), &1u32);
    }

    /// Create a new prediction market
    pub fn create_prediction(env: Env, prediction_id: u32) {
        let storage = env.storage().persistent();
        let admin: Address = storage.get(&Symbol::new(&env, "admin")).unwrap();
        
        admin.require_auth();

        // Store prediction data as separate fields to avoid custom struct serialization
        let pred_key: Symbol = Symbol::new(&env, "pred");
        let mut predictions: Map<u32, Vec<i128>> = storage.get(&pred_key).unwrap_or(Map::new(&env));
        
        // Vec format: [yes_amount, no_amount, resolved (0/1), result (0/1)]
        let pred_data = Vec::from_array(&env, [0i128, 0i128, 0i128, 0i128]);
        predictions.set(prediction_id, pred_data);
        
        storage.set(&pred_key, &predictions);
    }

    /// Place a bet on a prediction
    pub fn place_bet(env: Env, prediction_id: u32, bettor: Address, amount: i128, prediction: bool) {
        let storage = env.storage().persistent();
        let token: Address = storage.get(&Symbol::new(&env, "token")).unwrap();

        bettor.require_auth();

        // Transfer xlm tokens from bettor to contract
        soroban_sdk::token::Client::new(&env, &token)
            .transfer(&bettor, &env.current_contract_address(), &amount);

        // Update prediction amounts
        let pred_key: Symbol = Symbol::new(&env, "pred");
        let mut predictions: Map<u32, Vec<i128>> = storage.get(&pred_key).unwrap_or(Map::new(&env));
        
        let mut pred_data = predictions.get(prediction_id).unwrap_or(Vec::from_array(&env, [0i128, 0i128, 0i128, 0i128]));
        
        if prediction {
            // Update yes_amount (index 0)
            let current_yes = pred_data.get_unchecked(0);
            pred_data.set(0, current_yes + amount);
        } else {
            // Update no_amount (index 1)
            let current_no = pred_data.get_unchecked(1);
            pred_data.set(1, current_no + amount);
        }
        
        predictions.set(prediction_id, pred_data);
        storage.set(&pred_key, &predictions);

        // Store bet record - bets are stored per user per prediction
        // Map: prediction_id -> (bettor -> Vec of bets)
        let bets_key: Symbol = Symbol::new(&env, "bets");
        let mut all_bets: Map<u32, Map<Address, Vec<(bool, i128)>>> = storage.get(&bets_key).unwrap_or(Map::new(&env));
        
        let mut pred_bets = all_bets.get(prediction_id).unwrap_or(Map::new(&env));
        let mut user_bets = pred_bets.get(bettor.clone()).unwrap_or(Vec::new(&env));
        user_bets.push_back((prediction, amount));
        
        pred_bets.set(bettor, user_bets);
        all_bets.set(prediction_id, pred_bets);
        storage.set(&bets_key, &all_bets);
    }

    /// Resolve a prediction and distribute winnings
    pub fn resolve_prediction(env: Env, prediction_id: u32, result: bool) {
        let storage = env.storage().persistent();
        let admin: Address = storage.get(&Symbol::new(&env, "admin")).unwrap();

        admin.require_auth();

        let pred_key: Symbol = Symbol::new(&env, "pred");
        let mut predictions: Map<u32, Vec<i128>> = storage.get(&pred_key).unwrap_or(Map::new(&env));
        
        let mut pred_data = predictions.get(prediction_id).unwrap_or(Vec::from_array(&env, [0i128, 0i128, 0i128, 0i128]));
        
        // Mark as resolved (index 2 = 1)
        pred_data.set(2, 1i128);
        // Set result (index 3)
        pred_data.set(3, if result { 1i128 } else { 0i128 });
        
        predictions.set(prediction_id, pred_data);
        storage.set(&pred_key, &predictions);
    }

    /// Get prediction details as a vector [yes_amount, no_amount, resolved, result]
    pub fn get_prediction(env: Env, prediction_id: u32) -> Vec<i128> {
        let storage = env.storage().persistent();
        let pred_key: Symbol = Symbol::new(&env, "pred");
        let predictions: Map<u32, Vec<i128>> = storage.get(&pred_key).unwrap_or(Map::new(&env));
        predictions.get(prediction_id).unwrap_or(Vec::from_array(&env, [0i128, 0i128, 0i128, 0i128]))
    }

    /// Get user's bets for a prediction
    pub fn get_user_bets(env: Env, prediction_id: u32, bettor: Address) -> Vec<(bool, i128)> {
        let storage = env.storage().persistent();
        let bets_key: Symbol = Symbol::new(&env, "bets");
        let all_bets: Map<u32, Map<Address, Vec<(bool, i128)>>> = storage.get(&bets_key).unwrap_or(Map::new(&env));
        
        let pred_bets = all_bets.get(prediction_id).unwrap_or(Map::new(&env));
        pred_bets.get(bettor.clone()).unwrap_or(Vec::new(&env))
    }
}
