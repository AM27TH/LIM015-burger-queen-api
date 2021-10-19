module.exports = {
  paginate: (url, option, limit, page, totalPages, dbCollection) => ({
    first: `${url}?limit=${limit}&page=1${option.name ? `&${option.name}=${option.value}` : ''}`,
    prev: `${url}?limit=${limit}&page=${dbCollection.hasPrevPage ? page - 1 : page}${option.name ? `&${option.name}=${option.value}` : ''}`,
    next: `${url}?limit=${limit}&page=${dbCollection.hasNextPage ? page + 1 : totalPages}${option.name ? `&${option.name}=${option.value}` : ''}`,
    last: `${url}?limit=${limit}&page=${totalPages}${option.name ? `&${option.name}=${option.value}` : ''}`,
  }),
};
