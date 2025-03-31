import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
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
    const { userId, action, resourceType, resourceId, details } = await req.json();
    
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    // Convert resourceId to string to store the full ID
    await pool.query(query, [
      userId, 
      action, 
      resourceType, 
      resourceId.toString(), // Store as string
      details
    ]);
    
    return NextResponse.json({ message: 'Audit log created successfully' });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}

