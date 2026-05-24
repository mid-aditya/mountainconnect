/** Mirror of backend seed — for login page hints only */
export const SEED_ACCOUNTS = {
  admin: {
    email: "admin@mountainconnect.id",
    password: "Admin123!",
    label: "Admin dashboard",
  },
  user: {
    email: "user@mountainconnect.id",
    password: "User123!",
    label: "POV Pendaki (/user)",
  },
  operator: {
    email: "operator@mountainconnect.id",
    password: "Operator123!",
    label: "Operator dashboard",
  },
} as const;
