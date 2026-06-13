import crypto from "node:crypto";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password, salt) {
  return sha256(`${password}${salt}`);
}

export function verifyPassword(password, user) {
  if (!user) {
    return false;
  }

  const candidateHashes = [
    hashPassword(password, user.salt),
    sha256(`${user.salt}${password}`),
  ];

  return candidateHashes.some((candidateHash) =>
    crypto.timingSafeEqual(
      Buffer.from(candidateHash, "hex"),
      Buffer.from(user.password_hash, "hex"),
    ),
  );
}
