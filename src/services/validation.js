const emailValidation = (email) => {
  const emailRegex = new RegExp(/^\S+@\S+\.\S+$/);
  return emailRegex.test(email);
};

const passwordValidation = (password) => {
  const passwordRegex = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#&()–[{}\]:;',?/*~$^+=<>]).{8,20}$/);
  return passwordRegex.test(password);
};

const idValidation = (id) => {
  const checkForValidMongoDbID = new RegExp(/^[0-9a-fA-F]{24}$/);
  return checkForValidMongoDbID.test(id);
};

module.exports = {
  emailValidation, passwordValidation, idValidation,
};
