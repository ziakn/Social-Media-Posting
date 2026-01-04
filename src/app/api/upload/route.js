// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const relativeUploadDir = `/uploads/${year}/${month}/${day}`;
        const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            console.error('Error creating directory:', e);
        }

        const ext = path.extname(file.name);
        const randomSalt = Math.floor(100000 + Math.random() * 900000);
        const timestamp = Date.now();
        const filename = `${year}${month}${day}_${randomSalt}_${timestamp}${ext}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const origin = request.nextUrl.origin;
        const publicUrl = `${origin}${relativeUploadDir}/${filename}`;

        return NextResponse.json({
            url: publicUrl,
            storagePath: path.join('public', relativeUploadDir, filename),
            success: true
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}