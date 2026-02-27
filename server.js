// Disable Turbopack to fix Prisma compatibility issues
process.env.NEXT_PRIVATE_DISABLE_TURBO = '1';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  httpServer.listen(port, hostname, () => {
    console.log('');
    console.log('========================================');
    console.log('  Telegram Web App Ready!');
    console.log(`  URL: http://${hostname}:${port}`);
    console.log('========================================');
    console.log('');
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  process.exit(0);
});
