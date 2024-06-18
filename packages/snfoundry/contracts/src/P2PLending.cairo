use starknet::ContractAddress;

#[starknet::interface]
pub trait IP2PLendingTrait<TContractState> {
    fn request_loan(
        ref self: TContractState, token: ContractAddress, amount: u256, interest_rate: u256
    );

    fn fund_loan(ref self: TContractState);
    fn get_loan(self: @TContractState, loan_id: felt252) -> P2PLending::Loan;
}

#[starknet::contract]
mod P2PLending {
    use openzeppelin::token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
    use starknet::{get_caller_address, storage_access::Store};
    use super::{ContractAddress, IP2PLendingTrait};

    #[storage]
    struct Storage {
        loans: LegacyMap::<felt252, Loan>,
        loanCount: felt252,
    }


    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        LoanRequest: LoanRequest,
    }

    #[derive(Drop, starknet::Event)]
    struct LoanRequest {
        #[key]
        user: ContractAddress,
        #[key]
        token: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, Serde, starknet::Store)]
    pub struct Loan {
        borrower: ContractAddress,
        token: ContractAddress,
        amount: u256,
        repayAmount: u256,
        fundedAmount: u256,
        deadline: u256,
        interest_rate: u256,
        status: felt252
    }


    #[constructor]
    fn constructor(ref self: ContractState) {}

    #[abi(embed_v0)]
    impl P2PLendingImpl of IP2PLendingTrait<ContractState> {
        fn request_loan(
            ref self: ContractState, token: ContractAddress, amount: u256, interest_rate: u256
        ) {
            let caller = get_caller_address();
            let loan_id = self.loanCount.read();
            let repayAmount = amount + (amount * interest_rate) / 100;
            let loan = Loan {
                borrower: caller,
                token: token,
                amount: amount,
                repayAmount: repayAmount,
                fundedAmount: 0,
                deadline: 0,
                interest_rate: interest_rate,
                status: 0
            };
            self.loans.write(loan_id, loan);
            self.emit(LoanRequest { user: caller, token: token, amount: amount, });
        }

        fn fund_loan(ref self: ContractState) {}

        fn get_loan(self: @ContractState, loan_id: felt252) -> Loan {
            self.loans.read(loan_id)
        }
    }
}
