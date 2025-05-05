"use server"

import { supabaseAdmin } from "@/lib/supabase"
import type { AuthFormData, AuthResponse } from "@/types/auth"
import bcrypt from "bcryptjs"

export async function login(data: AuthFormData): Promise<AuthResponse> {
  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("email, password")
      .eq("email", data.email)
      .single()

    if (fetchError || !user) {
      return {
        success: false,
        message: "Credenciales inválidas",
      }
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)

    if (!isValidPassword) {
      return {
        success: false,
        message: "Credenciales inválidas",
      }
    }

    await supabaseAdmin
      .from("users")
      .update({
        last_login: new Date().toISOString(),
      })
      .eq("email", data.email)

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      userData: {
        email: user.email,
      },
    }
  } catch (error) {
    console.error("Error de inicio de sesión:", error)
    return {
      success: false,
      message: "Ocurrió un error durante el inicio de sesión",
    }
  }
}

export async function register(data: AuthFormData): Promise<AuthResponse> {
  try {
    const { data: existingUser } = await supabaseAdmin.from("users").select("email").eq("email", data.email).single()

    if (existingUser) {
      return {
        success: false,
        message: "El usuario ya existe",
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const { error: createError } = await supabaseAdmin.from("users").insert([
      {
        email: data.email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (createError) {
      throw createError
    }

    return {
      success: true,
      message: "Registro exitoso",
      userData: {
        email: data.email,
      },
    }
  } catch (error) {
    console.error("Error de registro:", error)
    return {
      success: false,
      message: "Ocurrió un error durante el registro",
    }
  }
}
