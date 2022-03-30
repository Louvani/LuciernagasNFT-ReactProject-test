import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useState, useEffect} from "react";
import { ethers } from 'ethers';
import myEpicNFT from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = 'PaulaLouvani';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const CONTRACT_ADDRESS = "0xae0a8A73b547A33f7c8Cc08Ec980557C4688A33b"
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/`
// const TOTAL_MINT_COUNT = 50;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(null);
  const [nftMinted, setNftMinted] = useState(null);

  const checkIfWalletIsConnected = async () =>{
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum)
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      } else {
        console.log("Connected", accounts[0]);
        setCurrentAccount(account)
        getTotalNFTsMintedSoFar()
        // Setup listener! This is for the case where a user comes to our site
        // and ALREADY had their wallet connected + authorized.
        setupEventListener()
      }
      
    } else {
      console.log("No authorized account found");
    }
  }

  // implemente login method (connect wallet)
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please, Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      } else {
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        getTotalNFTsMintedSoFar()
        setupEventListener()
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! we have minted your NFT. it may be blank rigth now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_LINK}${tokenId.toNumber()}>`)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);
        console.log('--------------------------------------')
        let currentNFT =  await connectedContract.getTotalNFTs();
        setNftMinted(currentNFT.toNumber());
      }
    } catch (error) {
      console.log(error)
      console.log("Ethereum object doesn't exist!");
    }
  }

  const askContractToMintNft = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoading(false);
      }

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );


  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-container">
            <div className="logo">
              <p className="gradient-text">Luciernagas</p>
            </div>
            <div className="wallet-conection">
              { currentAccount ? <p> Wallet: {currentAccount.slice(0, 5)}...{currentAccount.slice(-3)} </p> : <p> Not connected </p> }
            </div>
          </div>
        </div>
      </header>
      <main>
      <section className="section-hero hero-homepage">
        <div className="container">
          <div className="section-body">
            <section className="section-inner">
              <p className="sub-text">
                Luciérnaga, luz que vaga,
                en la noche que divaga,
                con luna, con las estrellas,
                te pareces a una de éllas.
              </p>
              {currentAccount === "" ? (
                renderNotConnectedContainer()
              ) : !loading ? (
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                  Mint NFT
                </button>
              ) : (<p className="sub-text">Loading...</p>)}
              { nftMinted != null ? (
                <p className="sub-text">Hay {nftMinted} luciernagas de 25, visitalas en <a href="https://testnets.opensea.io/collection/squarenft-awdphpfvhb">OpenSea</a></p>
                ) : (
                <p className="sub-text">Se el primero en tener una luciernaga</p>
              )}
            </section>
          </div>
        </div>
      </section>

      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
