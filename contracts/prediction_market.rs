#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec, map, Map};

#[derive(Clone, Copy)]
pub struct Bet {
    pub bettor: Address,
    pub amount: i128,
    pub prediction: bool, // true = EVET, false = HAYIR
    pub prediction_id: u32,
}

#[derive(Clone, Copy)]
pub struct Prediction {
    pub id: u32,
    pub yes_amount: i128,
    pub no_amount: i128,
    pub resolved: bool,
    pub result: bool, // true = EVET won, false = HAYIR won
}

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
    pub fn create_prediction(env: Env, id: u32) {
        let storage = env.storage().persistent();
        let admin: Address = storage.get(&Symbol::new(&env, "admin")).unwrap();
        
        admin.require_auth();

        let prediction = Prediction {
            id,
            yes_amount: 0,
            no_amount: 0,
            resolved: false,
            result: false,
        };

        let key = Symbol::new(&env, &format!("prediction_{}", id));
        storage.set(&key, &prediction);
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
        let pred_key = Symbol::new(&env, &format!("prediction_{}", prediction_id));
        let mut pred: Prediction = storage.get(&pred_key).unwrap();

        if prediction {
            pred.yes_amount += amount;
        } else {
            pred.no_amount += amount;
        }

        storage.set(&pred_key, &pred);

        // Store bet record
        let bet_key = Symbol::new(&env, &format!("bet_{}_{}", prediction_id, bettor.clone()));
        let mut bets: Vec<(bool, i128)> = storage.get(&bet_key).unwrap_or(Vec::new(&env));
        bets.push_back((prediction, amount));
        storage.set(&bet_key, &bets);
    }

    /// Resolve a prediction and distribute winnings
    pub fn resolve_prediction(env: Env, prediction_id: u32, result: bool) {
        let storage = env.storage().persistent();
        let admin: Address = storage.get(&Symbol::new(&env, "admin")).unwrap();
        let token: Address = storage.get(&Symbol::new(&env, "token")).unwrap();

        admin.require_auth();

        let pred_key = Symbol::new(&env, &format!("prediction_{}", prediction_id));
        let mut pred: Prediction = storage.get(&pred_key).unwrap();

        pred.resolved = true;
        pred.result = result;
        storage.set(&pred_key, &pred);

        // Calculate winnings
        let total_pool = pred.yes_amount + pred.no_amount;
        let winning_pool = if result { pred.yes_amount } else { pred.no_amount };

        // Distribute to winners
        // (Implementation would iterate through bettors and send their share)
    }

    /// Get prediction details
    pub fn get_prediction(env: Env, prediction_id: u32) -> Prediction {
        let storage = env.storage().persistent();
        let key = Symbol::new(&env, &format!("prediction_{}", prediction_id));
        storage.get(&key).unwrap()
    }

    /// Get user's bets for a prediction
    pub fn get_user_bets(env: Env, prediction_id: u32, bettor: Address) -> Vec<(bool, i128)> {
        let storage = env.storage().persistent();
        let key = Symbol::new(&env, &format!("bet_{}_{}", prediction_id, bettor));
        storage.get(&key).unwrap_or(Vec::new(&env))
    }
}
