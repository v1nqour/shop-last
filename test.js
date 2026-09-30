const bcrypt = require("bcrypt");

(async () => {
  const password = "wassim@@3001";

  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);

  console.log("Compare with generated hash:", await bcrypt.compare(password, hash));

  console.log(
    "CompareSync with generated hash:",
    bcrypt.compareSync(password, hash)
  );
})();