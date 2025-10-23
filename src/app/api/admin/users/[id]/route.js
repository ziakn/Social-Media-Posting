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

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await prisma.users.delete({ where: { id: BigInt(id) } });

    return new Response(JSON.stringify({ success: true, message: 'User deleted' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name, email, password } = await req.json();

    const data = { name, email };
    if (password && password.trim() !== '') {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.users.update({
      where: { id: BigInt(id) },
      data,
    });

    return new Response(JSON.stringify({ success: true, user: serializeBigInt(user) }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
