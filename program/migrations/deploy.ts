const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
  const program = anchor.workspace.Remiteasy;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Deploying RemitEasy program...");
  
  // The program is already deployed by `anchor deploy`
  // This script can be used for initialization or additional setup
  
  console.log("Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Initialize the program with: anchor run initialize");
  console.log("2. Update the program ID in your frontend and backend");
  console.log("3. Fund your backend wallet with SOL for transaction fees");
};
