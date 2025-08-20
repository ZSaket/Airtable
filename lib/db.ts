// lib/db.ts
import { client } from "./mongodb"

export async function findUserByEmail(email: string) {
  const db = client.db("formbuilder")
  return db.collection("users").findOne({ email })
}

export async function insertUser(email: string, name: string) {
  const db = client.db("formbuilder")
  const newUser = {
    email,
    name,
    createdAt: new Date().toISOString(),
  }
  await db.collection("users").insertOne(newUser)
  return newUser
}
