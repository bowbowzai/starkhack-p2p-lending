import React, { useState } from "react";
import SelectToken from "../SelectToken/SelectToken";
import { Token } from "~~/types/loan";
import Image from "next/image";

const LoanForm = ({
  onSubmit,
  isSending,
}: {
  onSubmit: (data: any) => void;
  isSending: boolean;
}) => {
  const [selectedToken, setSelectedToken] = useState<Token>({
    id: "",
    name: "",
    icon: "",
    contractName: "Eth",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    loanAmount: "",
    token: { id: "", name: "", icon: "", contractName: "Eth" },
    deadline: "",
    interest: "",
  });

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...formData, token: selectedToken });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form className="space-y-4 w-[400px]" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            id="loanAmount"
            name="loanAmount"
            placeholder="Enter Amount"
            className="mt-1 border border-[#E1E1E1] rounded-[2px] bg-transparent focus:outline-none py-2 w-full px-4 text-sm text-white pl-10"
            value={formData.loanAmount}
            onChange={handleInputChange}
          />
        </div>
        <div className="relative">
          <input
            type="text"
            id="token"
            name="token"
            placeholder="Select token"
            className="mt-1 border border-[#E1E1E1] rounded-[2px] bg-transparent focus:outline-none py-2 w-full px-4 text-sm text-white pl-10"
            value={selectedToken.name}
            readOnly
            onClick={() => setIsModalOpen(true)}
          />
          {selectedToken.icon && (
            <Image
              src={selectedToken.icon}
              alt={selectedToken.name}
              width={24}
              height={24}
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            />
          )}
        </div>
        <div>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            placeholder="Choose deadline (mm/dd/yyyy)"
            className="mt-1 border border-[#E1E1E1] rounded-[2px] bg-transparent py-2 w-full px-4 text-sm text-white pl-10"
            value={formData.deadline}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <input
            type="text"
            id="interest"
            name="interest"
            placeholder="Input Interest"
            className="mt-1 border border-[#E1E1E1] rounded-[2px] bg-transparent focus:outline-none py-2 w-full px-4 text-sm text-white pl-10"
            value={formData.interest}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#9135F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Request Loan"}
        </button>
      </form>
      {isModalOpen && (
        <SelectToken
          onSelect={handleTokenSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LoanForm;
