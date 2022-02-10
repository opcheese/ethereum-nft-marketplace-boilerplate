import { ContactsOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTTokenIds = (addr) => {
  const { token } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTTokenIds, setNFTTokenIds] = useState([]);
  const [totalNFTs, setTotalNFTs] = useState();
  const [fetchSuccess, setFetchSuccess] = useState(true);
  const [fetching, setFetching] = useState(true);
  
  const {
    fetch: getNFTTokenIds,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(token.getAllTokenIds, {
    chain: chainId,
    address: addr,
    limit: 100,
  });

  useEffect(async () => {
    if (data?.result) {
      const NFTs = data.result;
      setTotalNFTs(data.total);
      setFetchSuccess(true);
      let promises = [];
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            let ur = 'https://dbg-metadata-staging.ludentes.ru/metadata/'+ NFT.token_uri +"/"
            let p = fetch(ur)
              .then((response) => 
              {
                let res = response.json();
                
                console.log(res)
                return res;
              })
              .then((data) => {
                let dt = data
                NFT.name = resolveLink(dt.name);
                NFT.description = resolveLink(dt.description);
                NFT.storageFees = resolveLink(dt.attributes[0].value);


              });
            promises.push(p);
          } catch (error) {
            setFetchSuccess(false);
              
          }
        }
      }
      await Promise.all(promises);
      setNFTTokenIds(NFTs);
      setFetching(false)
    }
  }, [data]);

  return {
    getNFTTokenIds,
    NFTTokenIds,
    totalNFTs,
    fetchSuccess,
    fetching,
    error,
    isLoading,
  };
};
