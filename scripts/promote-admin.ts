
import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../src/db/index';
// Import users from the same place the app does (src/db schema via index, or direct)
// actually src/db/index exports * from ./schema, so we can import users from there
import { users } from '../src/db/index';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

// Load environment variables from .env.local and .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function promoteToAdmin() {
  const email = 'prettyinpurple2021@gmail.com';
  console.log(`🔍 Finding user with email: ${email}...`);

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('Please register this account first if it does not exist.');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.id} (${user.email})`);
    console.log(`Current Role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('✨ User is already an admin.');
      process.exit(0);
    }

    // Set role to admin
    await db.update(users)
      .set({ 
        role: 'admin'
      })
      .where(eq(users.email, email));

    console.log(`🎉 Successfully promoted ${email} to ADMIN.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  }
}

promoteToAdmin();
