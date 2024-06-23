import { Token } from "~~/types/loan";
import { useDeployedContractInfo } from "./scaffold-stark";
import { useEffect, useMemo, useState } from "react";

const useTokenData = () => {
  const { data: usdtData } = useDeployedContractInfo("USDC");
  const { data: strkData } = useDeployedContractInfo("STRK");
  const { data: ethData } = useDeployedContractInfo("Eth");
  const [isFetching, setIsFetching] = useState(true);

  const tokens: Token[] = [
    {
      id: ethData?.address ?? "",
      name: "ETH",
      contractName: "Eth",
      icon: "/eth.svg",
    },
    {
      id: usdtData?.address ?? "",
      name: "USDC",
      contractName: "USDC",
      icon: "/usdt.svg",
    },
    {
      id: strkData?.address ?? "",
      name: "STRK",
      contractName: "STRK",
      icon: "/strk.svg",
    },
  ];

  useEffect(() => {
    if (usdtData?.address && strkData?.address && ethData?.address) {
      setIsFetching(false);
    }
  }, [usdtData, strkData, ethData]);

  const getTokenData = (adresss: string) => {
    return tokens.find((token) => token.id === adresss);
  };

  return { tokens, getTokenData, isFetching };
};

export default useTokenData;
