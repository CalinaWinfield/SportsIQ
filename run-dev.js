import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('?? Starting SportIQ Full-Stack Application...');

// 1. Start backend server
const server = spawn(npmCmd, ['--prefix', 'server', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite client dev server
const client = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n?? Shutting down SportIQ processes...');
  try {
    if (isWin) {
      if (server.pid) spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
      if (client.pid) spawn('taskkill', ['/pid', String(client.pid), '/f', '/t']);
    } else {
      server.kill();
      client.kill();
    }
  } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
