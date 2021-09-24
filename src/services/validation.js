const emailValidation = (email) => {
  const emailRegex = new RegExp(/^\S+@\S+\.\S+$/);
  return emailRegex.test(email);
};

const passwordValidation = (password) => {
  const passwordRegex = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#&()–[{}\]:;',?/*~$^+=<>]).{8,20}$/);
  return passwordRegex.test(password);
};

module.exports = {
  emailValidation, passwordValidation,
};
