require('dotenv').config();

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

// Now run node-pg-migrate
const { spawn } = require('child_process');
const args = process.argv.slice(2);

const child = spawn('node-pg-migrate', args, {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    process.exit(code || 0);
});


