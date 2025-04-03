import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'default_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'default_db',
  password: process.env.POSTGRES_PASSWORD || 'default_password',
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

process.on('exit', () => {
  console.log('Closing database connection...');
  pool.end();
});

export async function GET() {
  try {
    const query = `
      SELECT 
        al.*,
        u.username as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (
      typeof body.userId !== 'number' ||  
      typeof body.action !== 'string' ||
      typeof body.resourceType !== 'string' ||
      typeof body.resourceId !== 'string' ||
      typeof body.details !== 'string'  
    ) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    await pool.query(query, [
      body.userId,
      body.action,
      body.resourceType,
      body.resourceId,
      body.details 
    ]);

    return NextResponse.json({ message: 'Audit log created successfully' });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}


