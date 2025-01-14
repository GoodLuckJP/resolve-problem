import crypto from "crypto";

const algorithm = "aes-256-cbc"; // 暗号化アルゴリズム
const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}

const key = Buffer.from(secretKey, "utf8");

if (key.length !== 32) {
  throw new Error("SECRET_KEY must be 32 bytes long");
}

// 暗号化
export function encryptId(id: number): string {
  const iv = crypto.randomBytes(16); // 初期化ベクトルを生成
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(String(id), "utf8", "hex");
  encrypted += cipher.final("hex");

  // IVと暗号化データを結合して返す
  return `${iv.toString("hex")}:${encrypted}`;
}

// 復号化
export function decryptId(encryptedData: string): number {
  console.log("復号化対象データ:", encryptedData);

  if (!encryptedData || typeof encryptedData !== "string") {
    throw new Error("Invalid encrypted data provided for decryption");
  }

  const [ivHex, encryptedHex] = encryptedData.split(":");

  if (!ivHex || !encryptedHex) {
    throw new Error(
      "Encrypted data is not in the expected format 'iv:encrypted'"
    );
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return parseInt(decrypted, 10);
}
