import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useMoralis,useMoralisQuery } from "react-moralis";


export const useNFTBalanceTable = (options) => {
  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();

  const [NFTBalance, setNFTBalance] = useState([]);
  // const {
  //   fetch: getNFTBalance,
  //   data,
  //   error,
  //   isLoading,
  // } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, address:options.walletAddress, ...options });
  const [fetchSuccess, setFetchSuccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const queryMarketItems = useMoralisQuery("GoldNFTOwners");

  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "objectId",
      "createdAt",
      "address",
      "tokenId",
    ])
  );

  useEffect(async () => {
    if (fetchMarketItems) {
      const NFTs = fetchMarketItems.filter(x=>x.address === options.walletAddress);
      setFetchSuccess(true);
      setIsLoading(true);
      for (let NFT of NFTs) {

        try {
          console.log(NFT.tokenId)
          let sid = NFT.tokenId.toString();
          while (sid.length < 8) {
            sid = '0' + sid;
          }
          let ur = 'https://dbg-metadata-staging.ludentes.ru/api/' + sid
          await fetch(ur)
            .then((response) => {
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
          setIsLoading(false);


        }
      }
      setIsLoading(false);

      setNFTBalance(NFTs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fetchMarketItems)]);

  return { NFTBalance, fetchSuccess, isLoading };
};
