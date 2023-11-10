import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false); // State to control transaction history visibility

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Wallet connection functions
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const handleDepositAmountChange = (event) => {
    setDepositAmount(event.target.value);
  };

  const handleWithdrawAmountChange = (event) => {
    setWithdrawAmount(event.target.value);
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
      setDepositAmount("");

      // Record the deposit transaction with a timestamp
      const transaction = {
        type: "Deposit",
        amount: depositAmount,
        timestamp: new Date().toLocaleString(),
      };
      setTransactionHistory([...transactionHistory, transaction]);
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      setWithdrawAmount("");

      // Record the withdraw transaction with a timestamp
      const transaction = {
        type: "Withdraw",
        amount: withdrawAmount,
        timestamp: new Date().toLocaleString(),
      };
      setTransactionHistory([...transactionHistory, transaction]);
    }
  };

  
  const toggleTransactionHistory = () => {
    setShowHistory(!showHistory);
  };

  const renderTransactionHistory = () => {
    if (!showHistory) {
      return null; // Don't render the transaction history if showHistory is false
    }

    return (
      <div>
        <h2 style={{ fontFamily:"Arial", color: "white" }}>Transaction History</h2>
          {transactionHistory.map((transaction, index) => (
            <li style={{ fontFamily:"Arial"}} key={index}>
              {transaction.type} of {transaction.amount} ETH on {transaction.timestamp}
            </li>
          ))}
       
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    getBalance();
  }, []);

  return (
<main className="container">
  <div className="centered-content">
    <img
      src="https://assets-global.website-files.com/62418210ede7e7f14869de35/6245c9b2c388101db3d950f5_metacrafterslogo-gold.webp"
      alt="alternative-text"
      style={{ width: "65%", display: "block", margin: "0 auto" }}
    />
  </div>
  <header>
    <h1 style={{ fontFamily: "Arial", color: "white" }}>Welcome to the Metacrafters ATM!</h1>
  </header>
  {account ? (
    <div className="account-info">
      <p style={{ color: "white" }}>Your Account: {account}</p>
      <p style={{ color: "white" }}>Your Balance: {balance}</p>
      <div className="input-group">
        <label htmlFor="depositAmount" style={{ color: "white", marginRight: "10px" }}>
          Deposit Amount:
        </label>
        <input
          id="depositAmount"
          type="number"
          placeholder="Enter deposit amount"
          value={depositAmount}
          onChange={handleDepositAmountChange}
        />
        <button onClick={deposit}>Deposit</button>
      </div>
      <div className="input-group">
        <label htmlFor="withdrawAmount" style={{ color: "white", marginRight: "10px" }}>
          Withdraw Amount:
        </label>
        <input
          id="withdrawAmount"
          type="number"
          placeholder="Enter withdraw amount"
          value={withdrawAmount}
          onChange={handleWithdrawAmountChange}
        />
        <button onClick={withdraw}>Withdraw</button>
      </div>
      <br />
      <button onClick={toggleTransactionHistory}>
        {showHistory ? "Hide Transaction History" : "Show Transaction History"}
      </button>
      {renderTransactionHistory()}
    </div>
  ) : (
    <button onClick={connectAccount}>Please connect your Metamask wallet</button>
  )}
  <style jsx>{`
    .container {
      text-align: center;
      background: black;
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color:white;
    }
    header {
      margin-bottom: 30px;
    }
    h1, p, label, button {
      font-family: Arial;
      color: white;
    }
    .account-info {
      font-family: Arial;
    }
    .input-group {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    input {
      padding: 10px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    }
  `}</style>
</main>
  );
}
