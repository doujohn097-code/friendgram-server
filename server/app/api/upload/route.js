import { auth } from '@/lib/firebaseAdmin';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await auth.verifyIdToken(token);

    const form = await request.formData();
    const file = form.get('file');
    if (!file) return Response.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${file.name || 'image'}`;
    const url = await uploadToR2(key, buffer, file.type || 'application/octet-stream');

    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
