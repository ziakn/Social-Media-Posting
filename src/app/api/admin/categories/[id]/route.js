import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

export async function PUT(req, { params }) {
  try {
    const { name, slug } = await req.json();
    const updated = await prisma.categories.update({
      where: { id: BigInt(params.id) },
      data: { name, slug },
    });
    return new Response(JSON.stringify({ success: true, category: serializeBigInt(updated) }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.categories.delete({ where: { id: BigInt(params.id) } });
    return new Response(JSON.stringify({ success: true, message: 'Category deleted' }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
