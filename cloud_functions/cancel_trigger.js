Moralis.Cloud.afterSave("MarketItemCanceled", async (request) => {
    const logger = Moralis.Cloud.getLogger();
    logger.info('I am here');
    const query = new Moralis.Query('MarketItemCreatedii')
   query.equalTo('itemId', request.object.get('itemId'))
   const object = await query.first({useMasterKey:true})
    if (object) {
      object.destroy({useMasterKey:true}).then(() => {
        logger.info('The object was deleted from MarketItemCreatedii.');
      }, (error) => {
        logger.info(error);
      });
    }
  });