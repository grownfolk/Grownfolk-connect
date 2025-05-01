async function connectWallet() {
  const provider = new WalletConnectProvider.default({
    rpc: {
      137: "https://polygon-rpc.com"
    }
  });

  await provider.enable();
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const address = await signer.getAddress();
  document.getElementById("wallet-address").innerText = "Connected: " + address;
}
