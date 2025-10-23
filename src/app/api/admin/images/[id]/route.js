import { PrismaClient } from '@/generated/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const formData = await req.formData();

    const title = formData.get('title');
    const file = formData.get('file');

    const updateData = { title };

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = path.join(process.cwd(), '/public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      updateData.file_path = `/uploads/${fileName}`;
    }

    const image = await prisma.images.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return new Response(JSON.stringify({ success: true, image: serializeBigInt(image) }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
// DELETE (delete image)
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.images.delete({ where: { id: parseInt(id) } });
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
