import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';

await connectDB();
const user = await User.findOne({ email: 'testuser@example.com' });
console.log(JSON.stringify(user, null, 2));
console.log('passwordMatches', await user.matchPassword('Password123'));
process.exit(0);
