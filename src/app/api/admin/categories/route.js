import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

// GET with pagination
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.categories.count();
    const categories = await prisma.categories.findMany({
      skip,
      take: limit,
      orderBy: { id: 'desc' },
    });

    const lastPage = Math.ceil(total / limit);

    return new Response(
      JSON.stringify({
        success: true,
        categories: serializeBigInt(categories),
        pagination: { page, lastPage, total },
      })
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

// POST remains same
export async function POST(req) {
  try {
    const { name, slug } = await req.json();
    const category = await prisma.categories.create({ data: { name, slug } });
    return new Response(JSON.stringify({ success: true, category }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
