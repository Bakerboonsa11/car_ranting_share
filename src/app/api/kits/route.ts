import { NextResponse } from 'next/server';
import formidable from 'formidable';
import { Readable } from 'stream';
import dbConnect from '@/lib/db';
import Kit from '@/models/product';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: Convert Web ReadableStream to Node Readable
async function webStreamToNodeReadable(webStream: ReadableStream<Uint8Array>) {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const nodeReadable = await webStreamToNodeReadable(req.body!);

    const fakeRequest = Object.assign(nodeReadable, {
      headers: Object.fromEntries(req.headers),  // important!
      method: req.method,
      url: req.url,
    });

    const form = formidable({
      multiples: false,
      uploadDir: './public/products',
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(fakeRequest as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    if (!files.image) {
      return NextResponse.json({ status: 'fail', message: 'No image uploaded' }, { status: 400 });
    }

    const imageFile = files.image;
    const filename = path.basename(Array.isArray(imageFile) ? imageFile[0].filepath : imageFile.filepath);

    const kitData = {
      name: fields.name?.[0],
      description: fields.description?.[0],
      category: fields.category?.[0],
      price: parseFloat(fields.price?.[0] || '0'),
      discount: parseFloat(fields.discount?.[0] || '0'),
      brand: fields.brand?.[0],
      images: [`${filename}`],
    };

    const createdKit = await Kit.create(kitData);

    return NextResponse.json({
      status: 'success',
      message: 'Kit created successfully',
      data: createdKit,
    });
  } catch (error: any) {
    console.error('Error while creating kit:', error);
    return NextResponse.json({ status: 'fail', message: error.message }, { status: 500 });
  }
}
