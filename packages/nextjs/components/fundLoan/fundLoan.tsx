import React, { useState } from "react";
import { validateAndParseAddress } from "starknet";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import {
  useScaffoldMultiWriteContract,
  createContractCall,
} from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import useTokenData from "~~/hooks/useTokenData";
import { getStatusName } from "~~/types/loan";

const FundLoan = ({
  setActiveContent,
  currentLoan,
}: {
  setActiveContent: (content: string) => void;
  currentLoan: any;
}) => {
  const [fundAmount, setFundAmount] = useState("0");

  const { data: contractData } = useDeployedContractInfo("P2PLending");
  const { getTokenData } = useTokenData();
  const token = getTokenData(validateAndParseAddress(currentLoan[1][0]));
  const { writeAsync, isPending } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall(token?.contractName ?? "Eth", "approve", [
        contractData?.address,
        Number(fundAmount.replace(",", "")),
      ]),
      createContractCall("P2PLending", "fund_loan", [
        currentLoan.id,
        Number(fundAmount.replace(",", "")),
      ]),
    ],
  });

  function onCancelClick() {
    setActiveContent("allLoans");
  }

  async function onFundClick() {
    if (Number(fundAmount) <= Number(currentLoan[1][1])) {
      await writeAsync();
      setActiveContent("allLoans");
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-6 py-8">
      <div>
        <h2 className="text-xl text-white mb-4 flex justify-center items-center font-bold">
          You are going to fund this loan
        </h2>
        <span className="text-[#A5A5A5]">
          Please check the information before transaction
        </span>
      </div>
      <div className="border border-solid border-[#444C6A] w-[400px] p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-white">yixuan.stormbit</span>
          <div className="flex">
            <span className="text-white">{currentLoan[1][1].toString()}</span>
            <span className="text-white">{token?.name ?? ""}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-white">
            {currentLoan[0][2].toString()} % interest
          </span>
          <span className={`text-white`}>
            {getStatusName(currentLoan[1][2].toString())}
          </span>
        </div>
      </div>
      <input
        type="text"
        className="border border-solid border-[#444C6A] w-[400px] p-2 pl-4 text-sm bg-transparent"
        placeholder="Enter Funding Amount"
        onChange={(e) => setFundAmount(e.target.value)}
      />
      <div className="flex gap-4 flex-col w-[400px]">
        <button
          className="bg-[#9135F5] py-2 px-[1rem] rounded-[8px] text-white"
          onClick={onFundClick}
          disabled={isPending}
        >
          {isPending ? "Funding..." : "Fund"}
        </button>
        <button
          className="bg-none border border-salid border-[#9135F5] py-2 px-[1rem] rounded-[8px] text-[#9135F5]"
          onClick={onCancelClick}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FundLoan;
