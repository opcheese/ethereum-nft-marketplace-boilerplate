import { useEffect, useState} from "react";
import { useMoralis } from "react-moralis";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
} from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
import NFTBalance from "components/NFTBalance";
import NFTTokenIds from "components/NFTTokenIds";
import { Menu, Layout, Button,Modal,Image} from "antd";
import SearchCollections from "components/SearchCollections";
import "antd/dist/antd.css";
import NativeBalance from "components/NativeBalance";
import "./style.css";
import Text from "antd/lib/typography/Text";
import NFTMarketTransactions from "components/NFTMarketTransactions";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";

const { Header, Footer } = Layout;

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();
  //const [currLoc, setCurrLoc] = useState("nftMarket");
  let currLoc = "nft";
  if (window.location.pathname.includes("nftBalance")) {
    currLoc = "nft";
  }
  // if (window.location.pathname.includes("Transactions")) {
  //   currLoc ="transactions";
  // }
  if (window.location.pathname.includes("NFTMarketPlace")) {
    currLoc = "nftMarket";
  }


  
  const [inputValue, setInputValue] = useState({name:"explore"});

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  const { marketAddress,  walletAddress,tokenAddress } = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  async function approveAll(nft) {
   console.log('main approval')
    const ops = {
      contractAddress: nft.tokenAddress,
      functionName: "setApprovalForAll",
      abi: [    {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
  ],
      params: {
        operator: nft.marketAddress,
        approved: true
      },
    };

    await contractProcessor.fetch({
      params: ops,
      throwOnError: true,
      onSuccess: () => {
        console.log("Approval Received");
    
        succApprove();
      },
      onError: (error) => {
        console.log(error)
      
        failApprove();
      },
    });
  }

  function succApprove() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `Approval is now set, you may list your NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }
  function failApprove() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem with setting approval`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        <Header style={styles.header}>
          <Logo />
          {/* <SearchCollections setInputValue={setInputValue}/> */}
          <Menu
            theme="light"
            mode="horizontal"
            style={{
              display: "flex",
              fontSize: "17px",
              fontWeight: "500",
              marginLeft: "50px",
              width: "100%",
            }}
            defaultSelectedKeys={[currLoc]}
          >
            <Menu.Item key="nftMarket" onClick={() => setInputValue({name:"explore"})} >
              <NavLink to="/NFTMarketPlace">🛒 Explore Market</NavLink>
            </Menu.Item>
            <Menu.Item key="nft">
              <NavLink to="/nftBalance">🖼 Your Collection</NavLink>
            </Menu.Item>
            {/* <Menu.Item key="transactions">
              <NavLink to="/Transactions">📑 Your Transactions</NavLink>
            </Menu.Item> */}
          </Menu>
          <div style={styles.headerRight}>
            <Chains />
            <NativeBalance />
            <Account />
            {isAuthenticated && isWeb3Enabled &&( <Button onClick={()=>approveAll({
              marketAddress,
              tokenAddress,
            })}> Approve</Button>)}
          </div>
        </Header>
        <div style={styles.content}>
          <Switch>
            <Route path="/nftBalance">
              <NFTBalance />
            </Route>
            <Route path="/NFTMarketPlace">
              <NFTTokenIds inputValue={inputValue} setInputValue={setInputValue}/>
            </Route>
            {/* <Route path="/Transactions">
              <NFTMarketTransactions />
            </Route> */}
          </Switch>
         
        </div>
      </Router>
      <Footer style={{ textAlign: "center" }}>
      
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <div style={{ display: "flex" }}>
  
    <Image width={50} src="https://lh4.googleusercontent.com/ilDz1k449nZRIN_AyizRhHLqabiyi-I55NgFOOH7-e3SQYzO2sMFw6YWISFBLbSJgL0zdqrne1lirqzY3eRn=w1920-h560">
    </Image>

    
  </div>
);

export default App;
