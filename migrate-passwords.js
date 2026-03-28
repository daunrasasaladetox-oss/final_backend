const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Script untuk migrate existing plain-text passwords ke hashed passwords
const filePath = path.join(__dirname, 'data/users.json');

async function migratePasswords() {
  console.log('🔐 Starting password migration to bcrypt encryption...\n');
  
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updated = 0;
  
  for (let i = 0; i < data.length; i++) {
    const user = data[i];
    
    // Check if password looks like it's already hashed (bcrypt hashes start with $2a, $2b, or $2y)
    if (user.password && !user.password.startsWith('$2')) {
      console.log(`Encrypting password for: ${user.nama} (${user.email})`);
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        data[i].password = hashedPassword;
        console.log(`✓ Done: ${user.password} → ${hashedPassword.substring(0, 40)}...`);
        updated++;
      } catch (err) {
        console.log(`✗ Error encrypting password for ${user.email}: ${err.message}`);
      }
    } else {
      console.log(`⊘ Skipped: ${user.email} (password already hashed or missing)`);
    }
  }
  
  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Migration complete! Updated ${updated} passwords.`);
  console.log(`📄 File saved: ${filePath}`);
}

migratePasswords().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});