import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: users, error } = await supabase
  .from('users')
  .select('id, name, email, role, created_at')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('\n=== ALL USERS IN DATABASE ===\n');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Role: ${u.role} | Email: ${u.email} | Name: ${u.name}`);
  });
  console.log(`\nTotal users: ${users.length}`);
}
