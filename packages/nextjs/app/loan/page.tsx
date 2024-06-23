"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import Table from "~~/components/Table";
import RequestLoan from "~~/components/RequestLoan";
import { Header } from "~~/components/Header";
import FundLoan from "~~/components/fundLoan/fundLoan";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { validateAndParseAddress } from "starknet-dev";
import { useAccount } from "@starknet-react/core";

const Loan: NextPage = () => {
  const [activeContent, setActiveContent] = useState("allLoans");
  const [currentLoan, setCurrentLoan] = useState(null);

  const { address } = useAccount();
  // TODO fix
  const { data: loans } = useScaffoldReadContract({
    contractName: "P2PLending",
    functionName: "get_loans",
  });

  const renderContent = () => {
    switch (activeContent) {
      case "allLoans":
        return (
          <Table
            setActiveContent={setActiveContent}
            loans={loans}
            setCurrentLoan={setCurrentLoan}
          />
        );
      case "myLoans":
        return (
          <Table
            setActiveContent={setActiveContent}
            //@ts-ignore
            loans={loans?.filter((loan) =>
              address
                ? //@ts-ignore
                  validateAndParseAddress(loan[0][0].toString()) ===
                  validateAndParseAddress(address)
                : false,
            )}
            setCurrentLoan={setCurrentLoan}
          />
        );
      case "requestLoan":
        return <RequestLoan setActiveContent={setActiveContent} />;
      case "fundLoan":
        return (
          <FundLoan
            setActiveContent={setActiveContent}
            currentLoan={currentLoan}
          />
        );
      default:
        return (
          <Table
            setActiveContent={setActiveContent}
            loans={loans}
            setCurrentLoan={setCurrentLoan}
          />
        );
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center flex-col flex-grow pt-10 bg-[#070817] gap-10 pb-6">
        <div className="border border-solid border-[#444C6A] w-full max-w-4xl px-10">
          <nav className="py-4">
            <ul className="flex space-x-4 justify-start">
              <li>
                <button
                  className={`${
                    activeContent === "allLoans"
                      ? "text-[#C398FF]"
                      : "text-[#444C6A]"
                  }`}
                  onClick={() => setActiveContent("allLoans")}
                >
                  All Loans
                </button>
              </li>
              <li>
                <button
                  className={`${
                    activeContent === "myLoans"
                      ? "text-[#C398FF]"
                      : "text-[#444C6A]"
                  }`}
                  onClick={() => setActiveContent("myLoans")}
                >
                  My Loans
                </button>
              </li>
              <li>
                <button
                  className={`${
                    activeContent === "requestLoan"
                      ? "text-[#C398FF]"
                      : "text-[#444C6A]"
                  }`}
                  onClick={() => setActiveContent("requestLoan")}
                >
                  Request Loan
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border border-solid border-[#444C6A] w-full max-w-4xl h-[600px] flex justify-center py-8">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Loan;
