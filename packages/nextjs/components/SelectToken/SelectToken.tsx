import React, { useState } from "react";
import ModalContainer from "../ModalContainer/ModalContainer";
import Image from "next/image";
import useTokenData from "~~/hooks/useTokenData";
import { Token } from "~~/types/loan";

const SelectToken = ({
  onSelect,
  onClose,
}: {
  onSelect: (token: Token) => void;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { tokens, isFetching } = useTokenData();

  const filteredTokens = tokens.filter((token) =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ModalContainer onClose={onClose}>
      <div className="p-4 w-[500px] bg-[#070817]">
        <div className="flex flex-col justify-center items-center text-white mb-16">
          <h1 className="text-2xl">Deposit tokens</h1>
          <span className="text-[#A5A5A5]">Select token</span>
        </div>
        <input
          type="text"
          placeholder="Search token"
          className="border border-[#E1E1E1] rounded py-2 px-4 mb-4 w-full mt-4 bg-transparent focus:outline text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isFetching ? (
          <div className="w-full h-full flex justify-center items-center">
            <p>Fetching tokens...</p>
          </div>
        ) : (
          <ul>
            {filteredTokens.map((token, index) => (
              <li
                key={index}
                className="py-2 cursor-pointer flex items-center text-white"
                onClick={() => onSelect(token)}
              >
                <Image
                  src={token.icon}
                  alt={token.name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                {token.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ModalContainer>
  );
};

export default SelectToken;
