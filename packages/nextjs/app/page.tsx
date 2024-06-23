"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import Image from "next/image";
import { useAccount } from "@starknet-react/core";
import Table from "~~/components/Table";
import { data } from "~~/components/data";
import RequestLoan from "~~/components/RequestLoan";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";

const Home: NextPage = () => {
  return (
    <div className="flex items-center justify-center flex-col flex-grow pt-10 bg-[#070817] gap-10">
      <Image src="/logo.png" alt="logo" width={150} height={217}></Image>
      <h1 className="text-5xl text-white">Welcome to starkstorm</h1>
      <CustomConnectButton></CustomConnectButton>
    </div>
  );
};

export default Home;
