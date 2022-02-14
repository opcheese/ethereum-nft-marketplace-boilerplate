Moralis.Cloud.afterSave("MarketItemCreatedii", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info('I am here: MarketItemCreatedii');
  if (request.object.get('confirmed')) {
    logger.info('Not confirmed MarketItemCreatedii');
    return;
  }
  const Monster = Moralis.Object.extend("ActiveMarketItems");
  const monster = new Monster();
  let fields = ["block_hash","block_timestamp", "price", ,"itemId", "owner", "address","seller","tokenId", "nftContract"]
  for(let f of fields) {
    monster.set(f,  request.object.get(f));
  }
  
  await monster.save(null,{useMasterKey:true});
  logger.info('The object was saved from MarketItemCreatedii.');

});



Moralis.Cloud.afterSave("MarketItemCanceled", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    logger.info('I am here: MarketItemCanceled');
    if (request.object.get('confirmed')) {
      logger.info('Not confirmed MarketItemCanceled');
      return;
    }
    const query = new Moralis.Query('ActiveMarketItems')
    query.equalTo('itemId', request.object.get('itemId'))
    const object = await query.first({useMasterKey:true})
      if (object) {
        object.destroy({useMasterKey:true}).then(() => {
          logger.info('The object was deleted from ActiveMarketItems.');
        }, (error) => {
          logger.info(error);
        });
      }
  });

Moralis.Cloud.afterSave("MarketItemSoldEvent", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    logger.info('I am here: MarketItemSold');
    if (request.object.get('confirmed')) {
      logger.info('Not confirmed marketitemsold');
      return;
    }
    const query = new Moralis.Query('ActiveMarketItems')
    query.equalTo('itemId', request.object.get('itemId'))
    // const object = await query.first({useMasterKey:true})
    //   if (object) {
    //     object.set('sold',true);
    //     await object.save({useMasterKey:true});
    //   }

    const object = await query.first({useMasterKey:true})
      if (object) {
        object.destroy({useMasterKey:true}).then(() => {
          logger.info('The object was deleted from ActiveMarketItems.');
        }, (error) => {
          logger.info(error);
        });
      }
  });