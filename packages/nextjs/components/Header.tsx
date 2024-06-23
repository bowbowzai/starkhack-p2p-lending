"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "@starknet-react/core";
import { byteArray } from "starknet-dev";
import { useScaffoldMultiWriteContract } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useBalance } from "@starknet-react/core";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  // {
  //   label: "Home",
  //   href: "/",
  // },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { address } = useAccount();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  //@ts-ignore
  const { data: username } = useScaffoldReadContract({
    contractName: "P2PLending",
    functionName: "get_username",
    args: [address ?? ""],
  });

  const { writeAsync: faucet, isPending } = useScaffoldMultiWriteContract({
    calls: [
      /*{
        contractName: "Eth",
        functionName: "faucet",
        args: [address ?? "", 100 * 10 ** 18]
      },*/
      {
        contractName: "STRK",
        functionName: "faucet",
        args: [address ?? "", 1000],
      },
      {
        contractName: "USDC",
        functionName: "faucet",
        args: [address ?? "", 1000],
      },
    ],
  });

  const { data: balanceSTRK } = useBalance({ address });

  //console.log(balanceSTRK)

  const wrapInTryCatch =
    (fn: () => Promise<any>, errorMessageFnDescription: string) => async () => {
      try {
        await fn();
      } catch (error) {
        console.error(
          `Error calling ${errorMessageFnDescription} function`,
          error,
        );
      }
    };

  return (
    <div className="sticky lg:static top-0 navbar bg-[#070817] min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2 py-6">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${
              isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"
            }`}
            onClick={() => {
              setIsDrawerOpen((prevIsOpenState) => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link
          href="/"
          passHref
          className="hidden lg:flex items-center gap-4 ml-4 mr-6 shrink-0"
        >
          <div className="flex relative w-10 h-14">
            <Image
              alt="SE2 logo"
              className="cursor-pointer"
              width={40}
              height={60}
              src="/logo.png"
            />
          </div>
          <div className="flex text-xs bg-white px-4 py-1 rounded-[7px]">
            Beta testnet
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4 gap-4">
        <button
          className="flex items-center border border-solid border-[#C2B6FE] px-4 py-2 rounded-[7px] gap-2"
          onClick={wrapInTryCatch(faucet, "usdt")}
        >
          <Image src="/faucet.svg" alt="user" width={18} height={14}></Image>
          <span className="text-sm text-[#C2B6FE]">
            {isPending ? "Minting..." : "Faucet"}
          </span>
        </button>
        <div className="flex border border-solid border-[#C2B6FE] px-4 py-2 rounded-[7px] gap-2">
          <Image src="/user.svg" alt="user" width={18} height={14}></Image>
          <span className="text-sm text-[#C2B6FE]">
            {username ? byteArray.stringFromByteArray(username as any) : ""}
          </span>
        </div>
        <CustomConnectButton />
      </div>
    </div>
  );
};
