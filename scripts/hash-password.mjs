#!/usr/bin/env node
/**
 * Prints a bcrypt hash for DEMO_ADMIN_PASSWORD / DEMO_AGENT_PASSWORD, so plain passwords never sit in env files.
 *   npm run hash-password -- "your-strong-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "a password of at least 12 characters"');
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 12));
