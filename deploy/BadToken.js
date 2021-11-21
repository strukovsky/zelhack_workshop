module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  console.log("deploying token");

  await deploy("BadToken", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });
};

module.exports.tags = ["BadToken"];
