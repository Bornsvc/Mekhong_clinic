import { NextResponse } from 'next/server';
import pool from '@/backend/config/database';

// const pool = new Pool({
//   user: process.env.POSTGRESUSER || 'default_user',
//   host: process.env.POSTGRESHOST || 'localhost',
//   database: process.env.POSTGRESDB || 'default_db',
//   password: process.env.POSTGRESPASSWORD || 'default_password',
//   port: Number(process.env.POSTGRESPORT) || 5432,
//   connectionString: process.env.POSTGRESURL,
//   ssl: {
//     ca: fs.readFileSync('/path/to/rds-combined-ca-bundle.pem'),
//     rejectUnauthorized: false // เปิดใช้งาน SSL และยอมรับการเชื่อมต่อที่ไม่ถูกต้อง
//   }
// });

process.on('exit', () => {
  console.log('Closing database connection...');
  pool.end();
});

export async function GET() {
  try {
    const query = `
      SELECT al.id,
             TO_CHAR(al.created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
             u.username as user_name,
             al.action,
             al.resource_type,
             al.resource_id,
             CASE 
               WHEN al.old_details IS NOT NULL THEN
                 jsonb_build_object(
                   'changes', 
                   jsonb_build_object(
                     'first_name', (al.old_details::jsonb->'changes'->>'first_name'),
                     'last_name', (al.old_details::jsonb->'changes'->>'last_name'),
                     'birth_date', (al.old_details::jsonb->'changes'->>'birth_date'),
                     'age', (al.old_details::jsonb->'changes'->>'age'),
                     'phone_number', (al.old_details::jsonb->'changes'->>'phone_number'),
                     'gender', (al.old_details::jsonb->'changes'->>'gender'),
                     'medication', (al.old_details::jsonb->'changes'->>'medication'),
                     'balance', (al.old_details::jsonb->'changes'->>'balance'),
                     'diagnosis', (al.old_details::jsonb->'changes'->>'diagnosis'),
                     'address', (al.old_details::jsonb->'changes'->>'address')
                   )
                 )::text
               ELSE NULL 
             END as old_details,
             CASE 
               WHEN al.details IS NOT NULL THEN
                 jsonb_build_object(
                   'changes', 
                   jsonb_build_object(
                     'first_name', (al.details::jsonb->'changes'->>'first_name'),
                     'last_name', (al.details::jsonb->'changes'->>'last_name'),
                     'birth_date', (al.details::jsonb->'changes'->>'birth_date'),
                     'age', (al.details::jsonb->'changes'->>'age'),
                     'phone_number', (al.details::jsonb->'changes'->>'phone_number'),
                     'gender', (al.details::jsonb->'changes'->>'gender'),
                     'medication', (al.details::jsonb->'changes'->>'medication'),
                     'balance', (al.details::jsonb->'changes'->>'balance'),
                     'diagnosis', (al.details::jsonb->'changes'->>'diagnosis'),
                     'address', (al.details::jsonb->'changes'->>'address')
                   )
                 )::text
               ELSE NULL 
             END as details
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
      (body.details !== null && typeof body.details !== 'string') ||
      (body.oldDetails !== null && typeof body.oldDetails !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, old_details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    await pool.query(query, [
      body.userId,
      body.action,
      body.resourceType,
      body.resourceId,
      body.details,
      body.oldDetails
    ]);

    return NextResponse.json({ message: 'Audit log created successfully' });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}


