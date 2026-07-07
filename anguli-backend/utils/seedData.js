require('dotenv').config();
const mongoose = require('mongoose');
const State = require('../models/State');
const District = require('../models/District');
const Village = require('../models/Village');
const User = require('../models/User');

const statesData = [
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      { name: 'Gorakhpur', villages: ['Pipraich', 'Campierganj', 'Sahjanwa', 'Bansgaon'] },
      { name: 'Varanasi', villages: ['Ramnagar', 'Pindra', 'Chiraigaon', 'Sevapuri'] },
      { name: 'Lucknow', villages: ['Malihabad', 'Mohanlalganj', 'Bakshi Ka Talab', 'Gosainganj'] },
    ],
  },
  {
    name: 'Bihar',
    code: 'BR',
    districts: [
      { name: 'Patna', villages: ['Danapur', 'Phulwari Sharif', 'Maner', 'Bihta'] },
      { name: 'Gaya', villages: ['Bodh Gaya', 'Tikari', 'Sherghati', 'Wazirganj'] },
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    districts: [
      { name: 'Bhopal', villages: ['Berasia', 'Phanda', 'Huzur', 'Kolar'] },
      { name: 'Indore', villages: ['Depalpur', 'Sanwer', 'Mhow', 'Hatod'] },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const existingStates = await State.countDocuments();
    if (existingStates > 0) {
      console.log('Database already has data. Skipping master data seed.');
    } else {
      for (const s of statesData) {
        const state = await State.create({ name: s.name, code: s.code });
        let districtsCount = 0;
        let villagesCount = 0;

        for (const d of s.districts) {
          const district = await District.create({ name: d.name, state: state._id });
          districtsCount += 1;

          for (const v of d.villages) {
            await Village.create({
              name: v,
              district: district._id,
              state: state._id,
              description: `${v} is a village located in ${d.name} district, ${s.name}.`,
              population: Math.floor(Math.random() * 5000) + 500,
            });
            villagesCount += 1;
          }
          await District.findByIdAndUpdate(district._id, { villagesCount: d.villages.length });
        }
        await State.findByIdAndUpdate(state._id, { districtsCount, villagesCount });
        console.log(`Seeded state: ${s.name} (${districtsCount} districts, ${villagesCount} villages)`);
      }
    }

    // Create default admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Anguli Admin',
        email: 'admin@anguli.in',
        password: 'ChangeThisPassword123',
        role: 'admin',
        isVerified: true,
      });
      console.log('Default admin created -> email: admin@anguli.in | password: ChangeThisPassword123');
      console.log('IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('Admin user already exists. Skipping.');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
