"use server"

// server action for admin auth since we can't use env vars on client side
export async function authenticateAdmin(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD
}
