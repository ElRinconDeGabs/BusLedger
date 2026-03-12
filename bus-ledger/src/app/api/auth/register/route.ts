import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

export async function POST(req: Request) {

  try {

    const {name, email, password } = await req.json()

    if ( !name || !email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    if (!PASSWORD_POLICY.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener 8 a 20 caracteres, incluir letras y numeros, sin caracteres especiales" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({
      message: "Registro exitoso",
      user,
    })

  } catch (error) {

    console.error("REGISTER ERROR:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )

  }

}