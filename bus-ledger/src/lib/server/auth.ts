import { cookies } from "next/headers"; // Import Next.js cookies API
import jwt from "jsonwebtoken"; // Import jsonwebtoken library

export async function getUserSession() {
  try {
    const cookieStore = await cookies(); // Await cookies API
    const token = cookieStore.get("token")?.value; // Retrieve token from cookies

    console.log("Token retrieved:", token); // Debugging log for token

    if (!token) {
      return null;
    }

    // Decode the token to extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token payload:", decoded); // Debugging log for decoded payload

    const userId = (decoded as { userId: number }).userId; // Correctly extract userId

    return userId ? { userId } : null; // Return userId as user session
  } catch (error) {
    console.error("Error accessing cookies or decoding token:", error); // Log any errors
    return null;
  }
}