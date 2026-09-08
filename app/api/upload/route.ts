import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file received.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // public/uploads folder must exist or be created, but for Next.js 
    // it's common to place it in the public folder to be served directly
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      await writeFile(join(uploadDir, uniqueName), buffer);
    } catch (e) {
      // If folder doesn't exist, try to create it and then write
      const fs = require('fs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        await writeFile(join(uploadDir, uniqueName), buffer);
      } else {
        throw e;
      }
    }

    // Return the URL path
    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ url: fileUrl, type: file.type });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file.' },
      { status: 500 }
    );
  }
}
