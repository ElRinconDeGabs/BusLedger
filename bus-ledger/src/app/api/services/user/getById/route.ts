import { userService } from "@/services/userServices"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      )
    }

    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID must be a valid integer" },
        { status: 400 }
      )
    }

    const user = await userService.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/services/user/getById ERROR:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
