import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        include: { categories: true },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.articles.count(),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        articles: serializeBigInt(articles),
        pagination: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}



export async function POST(req) {
  try {
    const { title, slug, summary, content, category_id } = await req.json();
    const article = await prisma.articles.create({
      data: {
        title,
        slug,
        summary,
        content,
        category_id: category_id ? BigInt(category_id) : null,
        user_id: BigInt(1), // default admin user, you can replace with logged-in user
      },
    });
    return new Response(JSON.stringify({ success: true, article: serializeBigInt(article) }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}