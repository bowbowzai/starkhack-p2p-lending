use starknet::ContractAddress;

#[starknet::interface]
pub trait IP2PLendingTrait<TContractState> {
    fn request_loan(
        ref self: TContractState,
        token: ContractAddress,
        amount: u256,
        interest_rate: u256,
        deadlineForFund: u64
    );
    fn fund_loan(ref self: TContractState, loan_id: felt252, amount: u256);
    fn repay_loan(ref self: TContractState, loan_id: felt252);
    fn register(ref self: TContractState, name: ByteArray);

    fn get_username(self: @TContractState, user: ContractAddress) -> ByteArray;
    fn get_loan_borrower(self: @TContractState, loan_id: felt252) -> ContractAddress;
    fn get_loan_token(self: @TContractState, loan_id: felt252) -> ContractAddress;
    fn get_loan_amount(self: @TContractState, loan_id: felt252) -> u256;
    fn get_loan_repay_amount(self: @TContractState, loan_id: felt252) -> u256;
    fn get_loan_funded_amount(self: @TContractState, loan_id: felt252) -> u256;
    fn get_loan_fund_deadline(self: @TContractState, loan_id: felt252) -> u64;
    fn get_loan_interest(self: @TContractState, loan_id: felt252) -> u256;
    fn get_loan_status(self: @TContractState, loan_id: felt252) -> u8;
    fn get_loan_count(self: @TContractState) -> felt252;
    fn get_funder_funded_amount(
        self: @TContractState, loan_id: felt252, funder: ContractAddress
    ) -> u256;
    fn get_funders_in_loan_counter(self: @TContractState, loan_id: felt252) -> u256;
}

#[starknet::contract]
mod P2PLending {
    use openzeppelin::token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
    use starknet::{
        get_caller_address, get_block_timestamp, contract_address_const, storage_access::Store
    };
    use super::{ContractAddress, IP2PLendingTrait};

    #[storage]
    struct Storage {
        loanBorrower: LegacyMap::<felt252, ContractAddress>,
        loanToken: LegacyMap::<felt252, ContractAddress>,
        loanAmount: LegacyMap::<felt252, u256>,
        loanRepayAmount: LegacyMap::<felt252, u256>,
        loanFundedAmount: LegacyMap::<felt252, u256>,
        loanFundDeadline: LegacyMap::<felt252, u64>,
        loanInterest: LegacyMap::<felt252, u256>,
        loanStatus: LegacyMap::<felt252, u8>, // 0 for pending, 1 for executed, 2 for paid
        loanCount: felt252,
        registeredUsers: LegacyMap::<ContractAddress, ByteArray>,
        fundersFundedAmount: LegacyMap::<(felt252, ContractAddress), u256>,
        fundersInLoanCounter: LegacyMap::<felt252, u256>,
        funderInLoan: LegacyMap::<(felt252, u256), ContractAddress>,
    }


    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        LoanRequest: LoanRequest,
        UserRegistration: UserRegistration,
        FundLoan: FundLoan,
        RepayLoan: RepayLoan
    }

    #[derive(Drop, starknet::Event)]
    struct LoanRequest {
        #[key]
        user: ContractAddress,
        #[key]
        token: ContractAddress,
        amount: u256,
        interest_rate: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct UserRegistration {
        #[key]
        user: ContractAddress,
        #[key]
        name: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    struct FundLoan {
        #[key]
        funder: ContractAddress,
        #[key]
        loanId: felt252,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RepayLoan {
        #[key]
        repayer: ContractAddress,
        #[key]
        receiver: ContractAddress,
        #[key]
        loanId: felt252,
        amount: u256,
    }


    #[constructor]
    fn constructor(ref self: ContractState) {}

    #[abi(embed_v0)]
    impl P2PLendingImpl of IP2PLendingTrait<ContractState> {
        fn request_loan(
            ref self: ContractState,
            token: ContractAddress,
            amount: u256,
            interest_rate: u256,
            deadlineForFund: u64
        ) {
            // required user to be registered
            assert!(self.registeredUsers.read(get_caller_address()) != "", "User not registered");
            let caller = get_caller_address();
            let loan_id = self.loanCount.read();
            let repayAmount = amount + (amount * interest_rate) / 100;
            self.loanBorrower.write(loan_id, caller);
            self.loanToken.write(loan_id, token);
            self.loanAmount.write(loan_id, amount);
            self.loanRepayAmount.write(loan_id, repayAmount);
            self.loanFundedAmount.write(loan_id, 0);
            self.loanFundDeadline.write(loan_id, get_block_timestamp() + deadlineForFund);
            self.loanInterest.write(loan_id, interest_rate);
            self.loanStatus.write(loan_id, 0);
            self.loanCount.write(loan_id + 1);

            self
                .emit(
                    LoanRequest {
                        user: caller, token: token, amount: amount, interest_rate: interest_rate
                    }
                );
        }

        fn fund_loan(ref self: ContractState, loan_id: felt252, amount: u256) {
            assert!(self.registeredUsers.read(get_caller_address()) != "", "User not registered");
            // check if loan is still pending
            assert!(self.loanStatus.read(loan_id) == 0, "Loan already funded");
            // check if deadline is passed
            assert!(get_block_timestamp() < self.loanFundDeadline.read(loan_id), "Deadline passed");
            // check if funded amount + amount < loan amount
            let fundedAmount = self.loanFundedAmount.read(loan_id) + amount;
            assert!(fundedAmount <= self.loanAmount.read(loan_id), "Loan fully funded");
            let caller = get_caller_address();
            let borrower = self.loanBorrower.read(loan_id);
            let token = self.loanToken.read(loan_id);
            // transfer token from caller to borrower
            let isSuccess = IERC20CamelDispatcher { contract_address: token }
                .transferFrom(caller, borrower, amount);
            assert!(isSuccess, "Transfer failed");
            if fundedAmount >= self.loanAmount.read(loan_id) {
                self.loanStatus.write(loan_id.clone(), 1); // fully funded
            }
            // update loan funded amount
            self.loanFundedAmount.write(loan_id.clone(), fundedAmount);
            // update funders in loans

            // update funder funded amount
            let funderFundedAmount = self.fundersFundedAmount.read((loan_id, caller)) + amount;
            if funderFundedAmount == amount {
                // first time funding
                let funderInLoanCounter = self.fundersInLoanCounter.read(loan_id) + 1;
                self.fundersInLoanCounter.write(loan_id, funderInLoanCounter);
                self.funderInLoan.write((loan_id, funderInLoanCounter), caller);
            }
            self.fundersFundedAmount.write((loan_id, caller), funderFundedAmount);
            self.emit(FundLoan { funder: caller, loanId: loan_id, amount: amount });
        }


        fn repay_loan(ref self: ContractState, loan_id: felt252) {
            assert!(self.registeredUsers.read(get_caller_address()) != "", "User not registered");
            // check if loan is in executing
            assert!(self.loanStatus.read(loan_id) == 1, "Loan not funded yet");
            // transfer token from caller to funder
            // first calculate the profit, profit = repay amount - borrowed amount
            let repayAmount = self.loanRepayAmount.read(loan_id);
            let borrowAmount = self.loanAmount.read(loan_id);
            let profit = repayAmount - borrowAmount;
            // get funder list
            let funderInLoanCounter = self.fundersInLoanCounter.read(loan_id);
            let mut i = 1;
            while i <= funderInLoanCounter {
                let funder = self.funderInLoan.read((loan_id, i));
                let fundedAmount = self.fundersFundedAmount.read((loan_id, funder));
                let profitShare = (fundedAmount * profit) / borrowAmount;
                let isSuccess = IERC20CamelDispatcher {
                    contract_address: self.loanToken.read(loan_id)
                }
                    .transferFrom(get_caller_address(), funder, fundedAmount + profitShare);
                assert!(isSuccess, "Transfer failed");
                self
                    .emit(
                        RepayLoan {
                            repayer: get_caller_address(),
                            receiver: funder,
                            loanId: loan_id,
                            amount: fundedAmount + profitShare
                        }
                    );
                i += 1;
            };
            // update loan status
            self.loanStatus.write(loan_id, 2);
        }

        fn register(ref self: ContractState, name: ByteArray) {
            let caller = get_caller_address();
            // first check if user registered
            assert!(self.registeredUsers.read(caller) == "", "User already registered");
            // if not register yet, check name cannot be empty
            assert!(name.len() > 0, "Name cannot be empty");
            let nameClone = name.clone();
            self.registeredUsers.write(caller, name);
            self.emit(UserRegistration { user: caller, name: nameClone });
        }

        // -----------------------------------------
        // ----------- GETTER FUNCTIONS -----------
        // -----------------------------------------

        fn get_username(self: @ContractState, user: ContractAddress) -> ByteArray {
            self.registeredUsers.read(user)
        }

        fn get_loan_borrower(self: @ContractState, loan_id: felt252) -> ContractAddress {
            self.loanBorrower.read(loan_id)
        }

        fn get_loan_token(self: @ContractState, loan_id: felt252) -> ContractAddress {
            self.loanToken.read(loan_id)
        }

        fn get_loan_amount(self: @ContractState, loan_id: felt252) -> u256 {
            self.loanAmount.read(loan_id)
        }

        fn get_loan_repay_amount(self: @ContractState, loan_id: felt252) -> u256 {
            self.loanRepayAmount.read(loan_id)
        }

        fn get_loan_funded_amount(self: @ContractState, loan_id: felt252) -> u256 {
            self.loanFundedAmount.read(loan_id)
        }

        fn get_loan_fund_deadline(self: @ContractState, loan_id: felt252) -> u64 {
            self.loanFundDeadline.read(loan_id)
        }

        fn get_loan_interest(self: @ContractState, loan_id: felt252) -> u256 {
            self.loanInterest.read(loan_id)
        }

        fn get_loan_status(self: @ContractState, loan_id: felt252) -> u8 {
            self.loanStatus.read(loan_id)
        }

        fn get_loan_count(self: @ContractState) -> felt252 {
            self.loanCount.read()
        }

        fn get_funder_funded_amount(
            self: @ContractState, loan_id: felt252, funder: ContractAddress
        ) -> u256 {
            self.fundersFundedAmount.read((loan_id, funder))
        }

        fn get_funders_in_loan_counter(self: @ContractState, loan_id: felt252) -> u256 {
            self.fundersInLoanCounter.read(loan_id)
        }
    }
}
