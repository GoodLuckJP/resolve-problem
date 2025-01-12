import bcrypt from "bcryptjs";

/**
 * 入力されたパスワードが保存されたハッシュと一致するかを確認
 * @param plainPassword 入力されたプレーンテキストのパスワード
 * @param hashedPassword 保存されたハッシュ化されたパスワード
 * @returns 一致する場合は true、しない場合は false
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
