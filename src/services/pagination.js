module.exports = {
  paginate: (url, limit, page, totalPages, dbCollection) => ({
    first: `${url}?limit=${limit}&page=1`,
    prev: dbCollection.hasPrevPage ? `${url}?limit=${limit}&page=${page - 1}` : `${url}?limit=${limit}&page=${page}`,
    next: dbCollection.hasNextPage ? `${url}?limit=${limit}&page=${page + 1}` : `${url}?limit=${limit}&page=${totalPages}`,
    last: `${url}?limit=${limit}&page=${totalPages}`,
  }),
};
