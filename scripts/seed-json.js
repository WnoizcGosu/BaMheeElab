const bcrypt = require('bcryptjs');
const fs = require('fs');
const crypto = require('crypto');

// The UUID is fixed to ensure it matches the Prisma side if we wanted, 
// but Prisma uses its own ID by default. We should just use a UUID.
const adminId = crypto.randomUUID();

const user = {
  id: adminId,
  username: 'admin',
  email: 'admin@local.dev',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString()
};

fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/users.json', JSON.stringify([user], null, 2));
console.log('OK - JSON Users seeded');
