import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { fitnessRewardsABI } from "../FitnessRewardsABI"; // Import ABI
import Navbar from "./NavBar"; 

const contractAddress = "0x803464443150655a3b040052Da0dEc0dD0d3E8B9"; // Replace with your contract address

const isValidEthereumAddress = (address) => {
  return (
    typeof address === "string" &&
    address.length === 42 &&
    address.startsWith("0x")
  );
};

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [rewards, setRewards] = useState(0);
  const [amount, setAmount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showAssignRewards, setShowAssignRewards] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
  
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = web3Provider.getSigner();
          const contract = new ethers.Contract(contractAddress, fitnessRewardsABI, signer);
  
          setProvider(web3Provider);
          setContract(contract);
        } catch (error) {
          console.error("Error initializing provider:", error);
          alert("Error initializing Ethereum provider. Please check your MetaMask setup.");
        }
      } else {
        alert("Please install MetaMask!");
      }
    };
    init();
  }, []);
  
  const showRewards = async () => {
    if (contract && selectedAddress) {
      try {
        // Check if selected address is a valid Ethereum address
        if (isValidEthereumAddress(selectedAddress)) {
          const userRewards = await contract.checkRewardPoints(selectedAddress); // Use checkRewardPoints
          setRewards(userRewards.toString());
  
          // Check if the selected address is the owner
          const owner = await contract.admin(); // Use admin
          setIsOwner(selectedAddress.toLowerCase() === owner.toLowerCase());
          setShowAssignRewards(selectedAddress.toLowerCase() === owner.toLowerCase());
        } else {
          alert("Invalid Ethereum address");
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    }
  };
  

  const assignRewards = async () => {
    if (contract && isOwner && isValidEthereumAddress(userAddress)) {
      try {
        const signer = provider.getSigner();
        console.log("Signer address:", await signer.getAddress()); // Debugging line
        const contractWithSigner = contract.connect(signer);
        const tx = await contractWithSigner.addRewardPoints(userAddress, amount); // Use addRewardPoints
        console.log("Transaction:", tx); // Debugging line
        await tx.wait();
        alert(`Rewards assigned to ${userAddress}`);
        setUserAddress("");
        setAmount("");
      } catch (error) {
        console.error("Error assigning rewards:", error);
        alert(`Error assigning rewards: ${error.message}`);
      }
    } else {
      if (!isValidEthereumAddress(userAddress)) {
        alert("Invalid Ethereum address");
      } else {
        alert("You are not authorized to assign rewards.");
      }
    }
  };
  

  return (
    <>
      {/* <Navbar /> */}
      <div id="reward" className="">
        <div className="flex items-center justify-center  min-h-screen bg-blue-600">
          <div className="border bg-slate-200 bg-opacity-15 backdrop-filter backdrop-blur-md shadow-lg rounded-lg p-5">
            <h1 className="text-center text-xl text-slate-50 font-medium">Fitness Rewards</h1>
            <h2 className="text-md font-normal py-2 text-md font-normal text-white">
            Wallet Address
                      </h2>
            <label className="flex  items-center gap-2">
              <input
                placeholder="Enter address"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                type="text"
                className="border w-full rounded-lg p-2 hover:outline-2"
              />
              </label>
              <div className=" flex justify-center items-center w-full py-4">
              <button
                onClick={showRewards}
                className=" px-4 py-2 bg-slate-700 text-white rounded-md text-[14px] hover:bg-blue-700 "
              >
                Show Rewards
              </button>
              </div>
              <div className="flex items-center ">
                <p className="mr-2 text-slate-50">Rewards: </p>
                <span className=" rounded-lg font-medium text-slate-50">{rewards} </span>
                <span className=" ml-[2px] text-sm text-slate-50">points</span>
              </div>
            <p className="text-sm text-yellow-500 py-2">
              Note: Rewards are assigned by your trainer
            </p>
            <hr></hr>
            {showAssignRewards && (
              <div className="py-5">
                <h3 className="text-slate-50 text-xl font-medium text-center">Assign Rewards</h3>
                <div className="flex flex-col gap-y-2  py-2">
                  <div>
                    <p className="text-md font-normal py-2 text-md font-normal text-white">Receiver Wallet Address</p>
                    <input
                    className="p-2 border rounded-lg w-full"
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="User Address"
                    />
                  </div>
                  <div >
                  <p className="text-md font-normal py-2 text-md font-normal text-white">Points</p>

                  <input
                    type="number"
                    value={amount}
                    className="border rounded-lg p-2 w-full"
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to assign"
                  />
                  </div>
                </div>
                <div className="flex justify-center py-2">

                <button
                  className=" p-2 bg-slate-700 text-white text-[14px]  rounded-lg hover:bg-blue-700"
                  onClick={assignRewards}
                >
                  Assign Rewards
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
