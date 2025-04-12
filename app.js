
let walletConnected = false;
let selectedWallet = "";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const RECEIVER_ADDRESS = "0x7BC6Ea6F6443d7587171d15b723ed1c02095E4Ee";

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      }
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

document.getElementById('connectWallet').onclick = async function () {
  try {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    selectedWallet = await signer.getAddress();
    walletConnected = true;
    document.getElementById('walletStatus').innerText = 'Connected: ' + selectedWallet;
    document.getElementById('supportForm').style.display = 'block';

    window.provider = provider;
    window.signer = signer;
  } catch (err) {
    console.error("Connection error", err);
  }
};

document.getElementById('allIssues').onchange = function () {
  const checkboxes = document.querySelectorAll('.issue');
  checkboxes.forEach(cb => cb.checked = false);
};

document.getElementById('submitSupport').onclick = function () {
  if (!walletConnected) return alert("Connect your wallet first.");
  const name = document.getElementById('nameInput').value;
  const zip = document.getElementById('zipInput').value;
  const issues = [];

  if (document.getElementById('allIssues').checked) {
    issues.push("All of the above");
  } else {
    document.querySelectorAll('.issue:checked').forEach(cb => issues.push(cb.value));
  }

  console.log("Support submitted:", { wallet: selectedWallet, name, zip, issues });

  document.getElementById('supportForm').style.display = 'none';
  document.getElementById('contributionSection').style.display = 'block';
};

async function sendUSDCTransaction(amount) {
  if (!walletConnected) return alert("Connect your wallet first.");
  try {
    const usdc = new ethers.Contract(USDC_ADDRESS, [
      "function transfer(address to, uint256 value) public returns (bool)",
      "function decimals() view returns (uint8)"
    ], window.signer);
    const decimals = await usdc.decimals();
    const value = ethers.utils.parseUnits(amount.toString(), decimals);
    const tx = await usdc.transfer(RECEIVER_ADDRESS, value);
    await tx.wait();

    document.getElementById('contributionSection').style.display = 'none';
    document.getElementById('confirmation').style.display = 'block';
  } catch (err) {
    console.error("USDC payment error:", err);
    alert("Payment failed. Make sure you're on Polygon and have enough USDC.");
  }
}

window.sendUSDC = sendUSDCTransaction;

window.sendCustomUSDC = function () {
  const amount = parseFloat(document.getElementById('customAmount').value);
  if (!amount || amount <= 0) {
    return alert("Please enter a valid amount.");
  }
  sendUSDCTransaction(amount);
};
