import { ContractName } from "~~/utils/scaffold-stark/contract";

export interface LoanData {
  loanAmount: string;
  token: Token;
  deadline: string;
  interest: string;
  tx: string;
}

export interface Token {
  id: string;
  name: string;
  icon: string;
  contractName: ContractName;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "0":
      return "bg-yellow-500";
    case "1":
      return "bg-[#5DDCA7]";
    case "2":
      return "bg-[#A3A3A3]";
    default:
      return "bg-[#A3A3A3]";
  }
};

export const getStatusName = (status: string) => {
  switch (status) {
    case "0":
      return "Pending";
    case "1":
      return "Executed";
    case "2":
      return "Paid";
    default:
      return "Pending";
  }
};
