import { useAccount } from "@starknet-react/core";
import React, { useEffect, useState } from "react";
import { validateAndParseAddress } from "starknet-dev";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import {
  createContractCall,
  useScaffoldMultiWriteContract,
} from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { getStatusName, getStatusColor } from "~~/types/loan";

const Table = ({
  setActiveContent,
  loans,
  setCurrentLoan,
}: {
  setActiveContent: (content: string) => void;
  loans: any;
  setCurrentLoan: (loan: any) => void;
}) => {
  const { address } = useAccount();
  const headers = [
    "Loan",
    "Deadline",
    "Interest",
    "Filled Amount",
    "Repay",
    "Status",
    "Action",
  ];

  const { data } = useDeployedContractInfo("P2PLending");
  const [repayArgs, setRepayArgs] = useState<{
    amount: string;
    loanId: number;
  } | null>(null);

  const { writeAsync, isPending } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Eth", "approve", [
        data?.address,
        Number(repayArgs?.amount ?? 0),
      ]),
      createContractCall("P2PLending", "repay_loan", [repayArgs?.loanId]),
    ],
  });

  const getActionName = (status: string, borrower: string) => {
    const isOwnLoan =
      address &&
      validateAndParseAddress(address) === validateAndParseAddress(borrower);
    if (status === "0") {
      return isOwnLoan ? "Cancel" : "Fund";
    } else if (status === "1") {
      return isOwnLoan ? "Repay" : "Executed";
    } else {
      return getStatusName(status);
    }
  };

  function timestampToDate(timestamp: number) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JavaScript months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function onActionClick(loan: any) {
    const status = loan[0][3].toString();
    const isOwnLoan =
      address &&
      validateAndParseAddress(address) ===
        validateAndParseAddress(loan[0][0].toString());

    if (status === "0" && !isOwnLoan) {
      setCurrentLoan(loan);
      setActiveContent("fundLoan");
    } else if (status === "1" && isOwnLoan) {
      setRepayArgs({ amount: loan[1][2].toString(), loanId: loan.id });
    }
  }

  useEffect(() => {
    if (repayArgs) {
      writeAsync();
      setRepayArgs(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repayArgs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#444C6A]">
        <thead className=" bg-[#070817]">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className=" bg-[#070817]">
          {loans &&
            loans.map((row: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {/* @ts-ignore */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{`${row[0][2].toString()}% interest rate`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {/* @ts-ignore */}
                  {timestampToDate(Number(row[0][1]))}
                </td>
                {/* @ts-ignore */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{`${row[0][2].toString()}% interest rate`}</td>
                {/* @ts-ignore */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{`${row[1][3].toString()}/${row[1][1].toString()}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {/* @ts-ignore */}
                  {row[1][2].toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white flex items-center">
                  <span
                    //@ts-ignore
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(row[0][3].toString())}`}
                  ></span>
                  {/* @ts-ignore */}
                  {getStatusName(row[0][3].toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <button
                    className="bg-[#C2B6FE] text-black py-2 px-4 rounded"
                    onClick={() =>
                      onActionClick({
                        ...row,
                        id: loans.length - 1 - rowIndex,
                      })
                    }
                  >
                    {isPending && repayArgs?.loanId === rowIndex
                      ? "Repaying..."
                      : getActionName(
                          //@ts-ignore
                          row[0][3].toString(),
                          //@ts-ignore
                          validateAndParseAddress(row[0][0].toString()),
                        )}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
