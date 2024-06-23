import React, { useEffect, useState } from "react";
import LoanForm from "./loanForm/loanForm";
import LoanSummary from "./loanSummary/loanSummary";
import { LoanData } from "~~/types/loan";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

const RequestLoan = ({
  setActiveContent,
}: {
  setActiveContent: (content: string) => void;
}) => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<LoanData>({
    loanAmount: "",
    token: { id: "", name: "", icon: "", contractName: "Eth" },
    deadline: "",
    interest: "",
    tx: "",
  });

  const { writeAsync, data, isPending } = useScaffoldWriteContract({
    contractName: "P2PLending",
    functionName: "request_loan",
    args: [
      formData.token.id,
      Number(formData.loanAmount),
      Number(formData.interest),
      new Date(formData.deadline).getTime(),
    ],
  });

  const handleFormSubmit = (data: LoanData) => {
    setFormData(data);
  };

  useEffect(() => {
    if (formData.loanAmount && formData.interest && formData.deadline) {
      writeAsync();
      setIsFormSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <div className="flex flex-col justify-center items-center">
      {isFormSubmitted && data ? (
        <LoanSummary
          formData={{ ...formData, tx: data.transaction_hash }}
          setActiveContent={setActiveContent}
        />
      ) : (
        <LoanForm onSubmit={handleFormSubmit} isSending={isPending} />
      )}
    </div>
  );
};

export default RequestLoan;
