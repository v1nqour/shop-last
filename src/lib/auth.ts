async authorize(credentials) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD;

  console.log("ADMIN_USERNAME:", adminUsername);
  console.log("ADMIN_PASSWORD:", adminPasswordHash);

  console.log("INPUT USERNAME:", credentials?.username);
  console.log("INPUT PASSWORD:", credentials?.password);

  if (!credentials?.username || !credentials?.password) return null;

  const isUsernameValid = credentials.username === adminUsername;

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    adminPasswordHash || ""
  );

  console.log("Username valid:", isUsernameValid);
  console.log("Password valid:", isPasswordValid);

  if (isUsernameValid && isPasswordValid) {
    return {
      id: "1",
      name: adminUsername,
      email: "admin@example.com",
    };
  }

  return null;
}
