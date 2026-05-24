/** PM2 process file — no Docker required */
module.exports = {
  apps: [
    {
      name: 'mountainconnect-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      error_file: './logs/dashboard-error.log',
      out_file: './logs/dashboard-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
