import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  await deployContract(
    {
      name: "USDC",
      symbol: "USDC",
      initial_supply: 1000n,
      recipient: deployer.address,
    },
    "MockToken",
    "USDC"
  );

  await deployContract(
    {
      name: "STRK",
      symbol: "STRK",
      initial_supply: 1000n,
      recipient: deployer.address,
    },
    "MockToken",
    "STRK"
  );

  await deployContract({}, "P2PLending");
};

deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
