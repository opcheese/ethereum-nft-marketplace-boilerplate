import React, { useState,useReducer } from "react";
import { useMoralis,useMoralisQuery } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button } from "antd";
import { useNFTBalanceTable } from "hooks/useNFTBalanceTable";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import { useWeb3ExecuteFunction } from "react-moralis";
import {useNFTMetadata} from "hooks/useNFTMetadata";

const { Meta } = Card;
const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
};

function NFTBalance() {
 
  const forceUpdate = ()=> window.location.reload();
//  const [_, forceUpdate] = useReducer((x) => {console.log(123);return x + 1}, 0);

  const { chainId, marketAddress, contractABI, walletAddress, tokenAddress } = useMoralisDapp();
  const { NFTBalance, fetchSuccess } = useNFTBalanceTable({walletAddress});
  //const { NFTOnSaleBalance, fetchOnSaleSuccess } = useNFTBalance({walletAddress:marketAddress});


  console.log(chainId)
  const { Moralis } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [nftToSend, setNftToSend] = useState(null);

  const [cancelVisible, setCancelVisibility] = useState(false);
  const [nftToCancel, setNftToCancel] = useState(null);

  const [price, setPrice] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(contractABI);
  const listItemFunction = "createMarketItem";
  const delistItemFunction = "cancelMarketItem";

  const queryMarketItems = useMoralisQuery("ActiveMarketItems");

  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "objectId",
      "createdAt",
      "price",
      "nftContract",
      "itemId",
      "sold",
      "tokenId",
      "seller",
      "owner",
      "confirmed",
    ])
  );
  let tokenIds = fetchMarketItems.filter((x)=>x.seller==walletAddress).map(x=>x.tokenId);

  const { NFTs } = useNFTMetadata(tokenIds);
  

  async function list(nft, listPrice) {
    setLoading(true);
    //todo: BN
    const p = Moralis.Units.Token(listPrice, "18");
    const ops = {
      contractAddress: marketAddress,
      functionName: listItemFunction,
      abi: contractABIJson,
      params: {
        nftContract: tokenAddress,
        tokenId: nft.tokenId,
        price: String(p),
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        setLoading(false);
        setVisibility(false);
        //addItemImage();
        succList();
      },
      onError: (error) => {
        console.log(error)

        setLoading(false);
        failList();
      },
    });
  }


  async function delist(nft) {
    setLoading(true);
    console.log(nft)
   
  
    const ops = {
      contractAddress: marketAddress,
      functionName: delistItemFunction,
      abi: contractABIJson,
      params: {
        itemId: nft.itemId,
       
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        setLoading(false);
        setCancelVisibility(false);
        
        succCancel();
      },
      onError: (error) => {
        console.log(error)

        setLoading(false);
        failCancel();
      },
    });
  }

  async function approveAll(nft) {
    setLoading(true);
   
    const ops = {
      contractAddress: nft.token_address,
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
        operator: marketAddress,
        approved: true
      },
    };

    await contractProcessor.fetch({
      params: ops,
      throwOnError: true,
      onSuccess: () => {
        console.log("Approval Received");
        setLoading(false);
        setVisibility(false);
        succApprove();
      },
      onError: (error) => {
        console.log(error)
        setLoading(false);
        failApprove();
      },
    });
  }

  const handleSellClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleRemoveFromSaleClick = (nft) => {
    setNftToCancel(nft);
    setCancelVisibility(true);
  };

  function succList() {
    let secondsToGo = 15;
    const modal = Modal.success({
      title: "Success!",
      content: `Your NFT was listed on the marketplace! Please allow time for blockchain transaction to be confirmed (about 3 min)`,
    });
    setTimeout(() => {
      modal.destroy();
      forceUpdate();
    }, secondsToGo * 1000);
  }

  function succCancel() {
    let secondsToGo = 15;
    const modal = Modal.success({
      title: "Success!",
      content: `Your NFT was delisted! Please allow time for blockchain transaction to be confirmed (about 3 min)`,
    });
    setTimeout(() => {
      modal.destroy();
      forceUpdate();
    }, secondsToGo * 1000);
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

  function failList() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem listing your NFT`,
    });
    setTimeout(() => {
      modal.destroy();
      //forceRerender();
    }, secondsToGo * 1000);
  }

  function failCancel() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem canceling your listing`,
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

  // function addItemImage() {
  //   const itemImage = new ItemImage();

  //   itemImage.set("image", nftToSend.image);
  //   itemImage.set("nftContract", nftToSend.token_address);
  //   itemImage.set("tokenId", nftToSend.token_id);
  //   itemImage.set("name", nftToSend.name);

  //   itemImage.save();
  // }

  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        e.nftContract === nft?.token_address &&
        e.tokenId === nft?.token_id //&&
        // e.sold === false &&
        // e.confirmed === true
    );
    return result;
  };

  const getMarketItemById = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        
        e.tokenId === nft?.tokenIdNumber.toString()  
    );
    return {...nft,...result};
  };



  let filteredOnSale = NFTs.map(x=>getMarketItemById(x));

  let NFTBalanceOrdered = null;
  if (NFTBalance) {
   NFTBalanceOrdered= NFTBalance.sort((a, b) =>  a.name.localeCompare( b.name))
   NFTBalanceOrdered = NFTBalanceOrdered.filter(x=>getMarketItem(x)==null)
  }
  return (
    <>
      <div style={{display: 'block'}}>
      {NFTBalanceOrdered && NFTBalanceOrdered.length>0 &&(<h2 style={styles.NFTs}>My tokens</h2>)}
      <div style={styles.NFTs}>
        {contractABIJson.noContractDeployed && (
          <>
            <Alert
              message="No Smart Contract Details Provided. Please deploy smart contract and provide address + ABI in the MoralisDappProvider.js file"
              type="error"
            />
            <div style={{ marginBottom: "10px" }}></div>
          </>
        )}
        {!fetchSuccess && (
          <>
            <Alert
              message="Unable to fetch all NFT metadata... We are searching for a solution, please try again later!"
              type="warning"
            />
            <div style={{ marginBottom: "10px" }}></div>
          </>
        )}
        {NFTBalanceOrdered &&
          NFTBalanceOrdered.map((nft, index) => (
            <Card key={index}
              hoverable
              actions={[
                <Tooltip title="View On Blockexplorer">
                  <FileSearchOutlined
                    onClick={() =>
                      window.open(
                        `${getExplorer(chainId)}token/${tokenAddress}?a=${nft.tokenId}`,
                        "_blank"
                      )
                    }
                  />
                </Tooltip>,
                <Tooltip title="List NFT for sale">
                  <ShoppingCartOutlined onClick={() => handleSellClick(nft)} />
                </Tooltip>,
              ]}
              style={{ width: 240, border: "2px solid #e7eaf3" }}
              cover={
                <Image
                  preview={false}
                  src={nft?.image || "error"}
                  fallback="https://lh3.googleusercontent.com/eYoolfQx1SnCxw_wmTJxGPsP6WEvkhqLwZ-o4xA3GEkkx9cpDUW6NKAwIUZCg1uKN17AxPfFVBOVRbd3KK1S=w1920-h560"
                  
                  alt=""
                  style={{ height: "240px" }}
                />
              }
              key={index}
            >
              <Meta title={nft.name} description={nft.description} />
              <p>Storage fees:{nft.storageFees}</p>
            </Card>
          ))}
      </div>

      {filteredOnSale && filteredOnSale.length>0 && (<h2 style={styles.NFTs}> My Tokens on Sale</h2>)}
      <div style={styles.NFTs}>
      
      
        {filteredOnSale &&
          filteredOnSale.map((nft, index) => (
            <Card
              hoverable
              actions={[
                <Tooltip title="View On Blockexplorer">
                  <FileSearchOutlined
                    onClick={() =>
                      window.open(
                        `${getExplorer(chainId)}token/${tokenAddress}?a=${nft.tokenId}`,
                        "_blank"
                      )
                    }
                  />
                </Tooltip>,
                <Tooltip title="Remove NFT from sale">
                  <ShoppingCartOutlined onClick={() => handleRemoveFromSaleClick(nft)} />
                </Tooltip>,
              ]}
              style={{ width: 240, border: "2px solid #e7eaf3" }}
              cover={
                <Image
                  preview={false}
                  src={nft?.image || "error"}
                  fallback="https://lh3.googleusercontent.com/eYoolfQx1SnCxw_wmTJxGPsP6WEvkhqLwZ-o4xA3GEkkx9cpDUW6NKAwIUZCg1uKN17AxPfFVBOVRbd3KK1S=w1920-h560"
                  alt=""
                  style={{ height: "240px" }}
                />
              }
              key={index}
            >
              <Meta title={nft.name} description={nft.description} />
              <p>Storage fees:{nft.storageFees}</p>
              <p>Listing price: {Moralis.Units.FromWei(nft.price)} Eth</p>
            </Card>
          ))}
      </div>
      </div>
      <Modal
        key="modalSell"
        title={`List ${nftToSend?.name} #${nftToSend?.tokenId} For Sale`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => list(nftToSend, price)}
        okText="List"
        footer={[
          <Button onClick={() => setVisibility(false)}>
            Cancel
          </Button>,
          // <Button onClick={() => approveAll(nftToSend)} type="primary">
          //   Approve
          // </Button>,
          <Button onClick={() => list(nftToSend, price)} type="primary">
            List
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          {/* <img
            src={`${nftToSend?.image}`}
            style={{
              width: "250px",
              margin: "auto",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          /> */}
          <Input
            autoFocus
            placeholder="Listing Price in Eth"
            onChange={(e) => setPrice(e.target.value)}
          />
        </Spin>
      </Modal>


      <Modal
        title={`Delist ${nftToCancel?.name} #${nftToCancel?.tokenId}`}
        visible={cancelVisible}
        onCancel={() => setCancelVisibility(false)}
        onOk={() => list(nftToCancel, price)}
        okText="Delist"
        footer={[
          <Button onClick={() => setCancelVisibility(false)}>
            Cancel
          </Button>,
      
          <Button onClick={() => delist(nftToCancel)} type="primary">
            Delist
          </Button>
        ]}
      >
        <Spin spinning={loading}>
         
         
        </Spin>
      </Modal>
    </>
  );
}

export default NFTBalance;
