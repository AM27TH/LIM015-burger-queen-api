module.exports = {
  getUsers: (req, resp, next) => {
    console.info(req.params);
    resp.json(req.params);
    next();
  },
};
