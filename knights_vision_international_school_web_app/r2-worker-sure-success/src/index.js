export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Custom-Auth-Key',
          'Access-Control-Max-Age': '3600',
        },
      });
    }

    const authKey = request.headers.get('X-Custom-Auth-Key');
    if (authKey !== env.AUTH_KEY_SECRET) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) {
      return new Response('Key is required', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (request.method === 'PUT') {
      try {
        const body = await request.arrayBuffer();
        if (!body) {
          return new Response('No file provided', {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          });
        }

        await env.SURE_SUCCESS_POINT_SCHOOL.put(key, body, {
          httpMetadata: { contentType: 'image/jpeg' },
        });
        const publicUrl = `https://pub-c5e66ea551584a87a7de1b76622e0e95.r2.dev/${key}`;
        return new Response(JSON.stringify({ url: publicUrl }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (err) {
        console.error('PUT error:', err.message, err.stack);
        return new Response(`Failed to upload file: ${err.message}`, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    if (request.method === 'DELETE') {
      try {
        await env.SURE_SUCCESS_POINT_SCHOOL.delete(key);
        return new Response('File deleted successfully', {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      } catch (err) {
        console.error('DELETE error:', err.message, err.stack);
        return new Response(`Failed to delete file: ${err.message}`, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  },
};