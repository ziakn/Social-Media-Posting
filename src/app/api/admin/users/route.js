import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { id: 'desc' },
    });

    return new Response(JSON.stringify({ success: true, users: serializeBigInt(users) }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}



export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return new Response(JSON.stringify({ success: false, message: 'Email already exists' }), { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { name, email, password: hashed },
    });

    return new Response(JSON.stringify({ success: true, user: serializeBigInt(user) }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}