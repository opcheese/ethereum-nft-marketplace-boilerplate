import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";


export const useNFTBalance = (options) => {
  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
 
  const [NFTBalance, setNFTBalance] = useState([]);
  const {
    fetch: getNFTBalance,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, address:options.walletAddress, ...options });
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(async () => {
    if (data?.result) {
      const NFTs = data.result;
      setFetchSuccess(true);
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = NFT.metadata?.image;
        } else if (NFT?.token_uri) {
          try {
            console.log(NFT.token_uri)
            let ur = 'https://dbg-metadata-staging.ludentes.ru/metadata/'+ NFT.token_uri +"/"
            await fetch(ur)
              .then((response) => 
              {
                let res = response.json();
                
                console.log(res)
                return res;
              })
              .then((data) => {
                let dt = data
                NFT.name = (dt.name);
                NFT.description = (dt.description);
                NFT.storageFees = (dt.attributes[0].value);


              });
          } catch (error) {
            console.log(error)
            setFetchSuccess(false);

/*          !!Temporary work around to avoid CORS issues when retrieving NFT images!!
            Create a proxy server as per https://dev.to/terieyenike/how-to-create-a-proxy-server-on-heroku-5b5c
            Replace <your url here> with your proxy server_url below
            Remove comments :)

              try {
                await fetch(`<your url here>/${NFT.token_uri}`)
                .then(response => response.json())
                .then(data => {
                  NFT.image = resolveLink(data.image);
                });
              } catch (error) {
                setFetchSuccess(false);
              }

 */
          }
        }
      }
      setNFTBalance(NFTs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { getNFTBalance, NFTBalance, fetchSuccess, error, isLoading };
};
