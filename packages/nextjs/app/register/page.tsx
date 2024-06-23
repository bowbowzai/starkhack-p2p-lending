"use client";

import { useDisconnect } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

function Page() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const { writeAsync, isPending } = useScaffoldWriteContract({
    contractName: "P2PLending",
    functionName: "register",
    args: [`${username}.starkstorm`],
  });

  const handleRegister = async () => {
    writeAsync().then(() => {
      router.push("/loan");
    });
  };

  const handleCancel = () => {
    disconnect();
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center flex-grow">
      <div className="w-[900px] rounded-[5px] bg-[#070817] text-white p-16 flex flex-col gap-10 items-center justify-center">
        <h1 className="text-2xl font-bold">Register</h1>
        <div className="flex flex-col">
          <div className="border border-solid border-[#374B6D] rounded-[7px] w-[760px] flex justify-between h-[47px] items-center mb-6">
            <input
              type="text"
              className="bg-transparent border-none focus:outline-none w-[680px] px-4"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <span className=" border-s border-[#374B6D] px-4">.starkstorm</span>
          </div>
          <button
            className="bg-[#9135F5] py-2 px-[1rem] rounded-[8px]"
            onClick={handleRegister}
            disabled={isPending}
          >
            {isPending ? "Registering..." : "Register"}
          </button>
          <button
            className="bg-none border border-salid border-[#9135F5] py-2 px-[1rem] rounded-[8px] mt-4 text-[#9135F5]"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
