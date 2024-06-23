import { useAccount } from "@starknet-react/core";
import React from "react";
import { byteArray } from "starknet-dev";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { LoanData } from "~~/types/loan";

const LoanSummary = ({
  formData,
  setActiveContent,
}: {
  formData: LoanData;
  setActiveContent: (content: string) => void;
}) => {
  const { address } = useAccount();

  //@ts-ignore
  const { data: username } = useScaffoldReadContract({
    contractName: "P2PLending",
    functionName: "get_username",
    args: [address ?? ""],
  });

  return (
    <div className="flex flex-col justify-center items-center gap-10 py-8">
      <div>
        <h2 className="text-xl text-white mb-4 flex justify-center items-center font-bold">
          Success!
        </h2>
        <span className="text-[#A5A5A5]">
          Your loan request has been successfully submmitted
        </span>
      </div>
      <div className="border border-solid border-[#444C6A] w-[400px] p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-white">
            {username ? byteArray.stringFromByteArray(username as any) : ""}
          </span>
          <div className="flex">
            <span className="text-white">{formData.loanAmount}</span>
            <span className="text-white">{formData.token.name}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-white">{formData.interest} % interest</span>
          <span className="text-white">Pending</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">{`Transaction Hash: ${formData.tx ? `${formData.tx.slice(0, 7)}...${formData.tx.slice(-5)}` : ""}`}</span>
        </div>
      </div>
      <div className="flex gap-4 flex-col w-[400px]">
        <button
          className="bg-[#9135F5] py-2 px-[1rem] rounded-[8px] text-white"
          onClick={() => setActiveContent("allLoans")}
        >
          Back To All Loans
        </button>
        <button
          className="bg-none border border-salid border-[#9135F5] py-2 px-[1rem] rounded-[8px] text-[#9135F5]"
          onClick={() => setActiveContent("request")}
        >
          Make another request
        </button>
      </div>
    </div>
  );
};

export default LoanSummary;
