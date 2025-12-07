require('dotenv').config();
const path = require('path');
const { spawn } = require('child_process');

// Generate DATABASE_URL from individual PostgreSQL variables if not set
if (!process.env.DATABASE_URL) {
    const {
        PGHOST = 'localhost',
        PGPORT = '5432',
        PGUSER,
        PGPASSWORD,
        PGDATABASE
    } = process.env;

    if (PGUSER && PGDATABASE) {
        // Build DATABASE_URL from individual variables
        const password = PGPASSWORD ? `:${PGPASSWORD}` : '';
        process.env.DATABASE_URL = `postgresql://${PGUSER}${password}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
        console.log('Generated DATABASE_URL from individual PostgreSQL variables');
    } else {
        console.error('Error: Either DATABASE_URL or PGUSER and PGDATABASE must be set');
        process.exit(1);
    }
}

// Path ke binary lokal node-pg-migrate di node_modules
const migrateBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'node-pg-migrate');
const args = process.argv.slice(2);

const child = spawn(migrateBin, args, {
    stdio: 'inherit',
    shell: false,
});

child.on('exit', (code) => {
    process.exit(code || 0);
});
