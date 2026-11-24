import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp' };
createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root,'.'+(pathname==='/'?'/media-art.html':pathname));
    if (!target.startsWith(root) || pathname.includes('/.')) {res.writeHead(403);res.end();return;}
    const body = await readFile(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(8765,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8765/media-art.html'));
