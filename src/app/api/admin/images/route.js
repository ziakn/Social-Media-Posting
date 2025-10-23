import { PrismaClient } from '@/generated/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

// GET with pagination
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 6;
    const skip = (page - 1) * limit;

    const total = await prisma.images.count();
    const images = await prisma.images.findMany({
      skip,
      take: limit,
      orderBy: { id: 'desc' },
    });

    const lastPage = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      success: true,
      images: serializeBigInt(images),
      pagination: { page, lastPage, total },
    }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function POST(req) {
    try {
      const formData = await req.formData();
      const file = formData.get('file');
      const title = formData.get('title') || 'Untitled';
  
      if (!file) {
        return new Response(JSON.stringify({ success: false, message: 'No file uploaded' }), { status: 400 });
      }
  
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      const uploadDir = path.join(process.cwd(), '/public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);
  
      fs.writeFileSync(filePath, buffer);
  
      const image = await prisma.images.create({
        data: { title, file_path: `/uploads/${fileName}` },
      });
  
      return new Response(JSON.stringify({ success: true, image: serializeBigInt(image) }));
    } catch (err) {
      return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
  }


  