import { ContactsOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTMetadata = (tokenIds) => {
  
  const [fetchSuccess, setFetchSuccess] = useState();
  const [fetching, setFetching] = useState();
  const [NFTs, setNFTs] = useState([]);
  

  useEffect(async () => {
    if (tokenIds) {
      const NFTs = [];
      let promises = [];
      setFetching(true)
      for (let NFTId of tokenIds) {
          try {
            let NFT = {};
            let sid = NFTId.toString();
            while (sid.length < 8) {
              sid = '0' + sid;
            }

            let ur = 'https://dbg-metadata-staging.ludentes.ru/api/'+ sid
            
            let p = fetch(ur)
              .then(async (response) => 
              {
                let res = response.json();
                
                console.log(response)
                let dt = await res;
                NFT.name = (dt.name);
                NFT.description = (dt.description);
                NFT.storageFees = (dt.attributes[0].value);
                NFT.tokenId = response.url.split("/").pop()
                NFT.tokenIdNumber = parseInt(NFT.tokenId)

                NFTs.push(NFT);

                return res;
              })
             
            promises.push(p);
          } catch (error) {
          setFetchSuccess(false);
          }
        }
      
      await Promise.all(promises);
      setFetchSuccess(true);

      setNFTs(NFTs);
      setFetching(false)
    }
  }, [JSON.stringify(tokenIds)]);

  return {
    NFTs,
    fetchSuccess,
    fetching,
   
  };
};
