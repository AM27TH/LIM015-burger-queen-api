module.exports = {
  paginate: (url, limit, page, totalPages, dbCollection) => ({
    first: `${url}?limit=${limit}&page=1`,
    prev: `${url}?limit=${limit}&page=${dbCollection.hasPrevPage ? page - 1 : page}`,
    next: `${url}?limit=${limit}&page=${dbCollection.hasNextPage ? page + 1 : totalPages}`,
    last: `${url}?limit=${limit}&page=${totalPages}`,
  }),
};
