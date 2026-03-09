import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password incorrecto" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: "Login correcto",
      userId: user.id,
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}