"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useNetworkColor } from "~~/hooks/scaffold-stark";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-stark";
import { useAccount, useNetwork } from "@starknet-react/core";
import { Address } from "@starknet-react/chains";
import { useState } from "react";
import Image from "next/image";
import ConnectModal from "./ConnectModal";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { byteArray } from "starknet-dev";
/**
 * Custom Connect Button (watch balance + custom design)
 */
export const CustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { address, status, chainId } = useAccount();
  const { chain } = useNetwork();
  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  //@ts-ignore
  const { data: username, isLoading } = useScaffoldReadContract({
    contractName: "P2PLending",
    functionName: "get_username",
    args: [address ?? ""],
  });

  const blockExplorerAddressLink = address
    ? getBlockExplorerAddressLink(targetNetwork, address)
    : undefined;

  const handleWalletConnect = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (pathname != "/loan" && status === "connected" && !isLoading) {
      if (byteArray.stringFromByteArray(username as any) != "") {
        router.push("/loan");
      } else {
        router.push("/register");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isLoading, username]);

  return status == "disconnected" ? (
    <>
      <button
        className="flex bg-[#C2B6FE] py-2 px-2 rounded-[7px] items-center text-sm"
        onClick={handleWalletConnect}
        type="button"
      >
        <Image
          src="/wallet.svg"
          alt="wallet"
          width={18}
          height={16}
          className="mx-2"
        ></Image>
        Connect Wallet
      </button>
      <ConnectModal isOpen={modalOpen} onClose={handleModalClose} />
    </>
  ) : chainId !== targetNetwork.id ? (
    <WrongNetworkDropdown />
  ) : (
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address as Address}
        displayName={""}
        ensAvatar={""}
        blockExplorerAddressLink={blockExplorerAddressLink}
      />
      <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
    </>
  );
};
