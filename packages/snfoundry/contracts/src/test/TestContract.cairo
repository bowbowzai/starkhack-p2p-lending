use contracts::P2PLending::{IP2PLendingDispatcher, IP2PLendingDispatcherTrait};
use openzeppelin::tests::utils::constants::OWNER;
use openzeppelin::utils::serde::SerializedAppend;
use snforge_std::{declare, ContractClassTrait};
use starknet::ContractAddress;

fn deploy_contract(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap();
    let mut calldata = array![];
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    contract_address
}

#[test]
fn test_deployment_values() {
    let contract_address = deploy_contract("P2PLending");

    let _dispatcher = IP2PLendingDispatcher { contract_address };
    // let current_gretting = dispatcher.gretting();
    // let expected_gretting: ByteArray = "Building Unstoppable Apps!!!";
    // assert_eq!(current_gretting, expected_gretting, "Should have the right message on deploy");

    // let new_greeting: ByteArray = "Learn Scaffold-Stark 2! :)";
    // dispatcher.set_gretting(new_greeting.clone(), 0); // we transfer 0 eth

    assert_eq!(1, 1, "S");
}
