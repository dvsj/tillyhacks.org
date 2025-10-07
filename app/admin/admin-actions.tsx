"use server"

export async function authenticateAdmin(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD
}
