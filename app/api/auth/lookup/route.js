import { getUserByUsername } from '@/lib/r2Store';

export async function POST(request) {
  try {
    const { username } = await request.json();
    if (!username) return Response.json({ error: 'Missing username' }, { status: 400 });

    const user = await getUserByUsername(username);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json({ email: user.email });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
