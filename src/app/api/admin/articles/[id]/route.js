import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { title, slug, summary, content, category_id } = await req.json();
    const article = await prisma.articles.update({
      where: { id: BigInt(id) },
      data: {
        title,
        slug,
        summary,
        content,
        category_id: category_id ? BigInt(category_id) : null,
      },
    });
    return new Response(JSON.stringify({ success: true, article: serializeBigInt(article) }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await prisma.articles.delete({ where: { id: BigInt(id) } });
    return new Response(JSON.stringify({ success: true, message: 'Article deleted' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}