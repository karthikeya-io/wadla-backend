const isHuman = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();
  // console.log(data);
  return data.success;
};

module.exports = isHuman;
