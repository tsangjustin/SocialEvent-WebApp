const elasticSearchClient = require("../config/elasticConnection");

let elasticSearch = exports = module.exports;

elasticSearch.search = async (data) => {
  try {
    const searchResult = await elasticSearchClient.search({  
      index: "event",
      // q: data.search,
      body: {
        query: {
          query_string: {
            query: `*${data.search}*`,
            fields: ["name", "description", "locationName"],
          },
            // filter: {
            //   type: { 
            //     value: "events", 
            //   },
            // },
        },
      }, 
    });
    return searchResult.hits.hits
      .map(e => ({
        ...e._source,
        _id: e._id,
      }));
  } catch (e) {
    return e;
  }
}
