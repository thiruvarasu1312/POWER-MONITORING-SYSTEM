import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database');

    // Clear existing data
    const clearQueries = [
        'DELETE FROM alerts',
        'DELETE FROM machines',
        'DELETE FROM users'
    ];

    let completedClear = 0;

    clearQueries.forEach(query => {
        db.query(query, (err) => {
            if (err) {
                console.error('❌ Error clearing data:', err.message);
            } else {
                console.log('✅ Cleared data');
            }
            completedClear++;
            
            if (completedClear === clearQueries.length) {
                insertData();
            }
        });
    });

    function insertData() {
        console.log('\n📝 Inserting fresh data...\n');

        // Hash passwords with bcrypt (same as login endpoint)
        const adminHash = bcrypt.hashSync('admin123', 10);
        const studentHash = bcrypt.hashSync('student123', 10);
        const kaviyaHash = bcrypt.hashSync('kaviya123', 10);

        // 1. Insert Users
        const userQueries = [
            { email: 'admin@powereye.com', password_hash: adminHash, name: 'Admin User', role: 'admin' },
            { email: 'student@powereye.com', password_hash: studentHash, name: 'Student User', role: 'operator' },
            { email: 'kaviya@powereye.com', password_hash: kaviyaHash, name: 'Kaviya Kumar', role: 'operator' }
        ];

        let userInserted = 0;
        const userIds = {};

        userQueries.forEach((user, idx) => {
            const sql = 'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)';
            db.query(sql, [user.email, user.password_hash, user.name, user.role], (err, results) => {
                if (err) {
                    console.error(`❌ Error inserting user ${user.email}:`, err.message);
                } else {
                    userIds[user.email] = results.insertId;
                    console.log(`✅ User inserted: ${user.email} (ID: ${results.insertId})`);
                }
                userInserted++;

                if (userInserted === userQueries.length) {
                    insertMachines(userIds);
                }
            });
        });
    }

    function insertMachines(userIds) {
        console.log('\n🏭 Inserting machines...\n');

        // Machines for each user
        const machinesData = [
            // Admin machines (user_id=1)
            { name: 'Motor Alpha', model: 'Industrial Motor X-2000', type: 'Motor', location: 'Factory Floor A', rated_power: 5.5, description: 'Main production motor', user_id: userIds['admin@powereye.com'] },
            { name: 'Pump Beta', model: 'Centrifugal Pump CP-500', type: 'Pump', location: 'Basement Level 1', rated_power: 3.2, description: 'Water circulation pump', user_id: userIds['admin@powereye.com'] },
            
            // Student machines (user_id=3)
            { name: 'Compressor Unit 1', model: 'Pneumatic Compressor PRO-300', type: 'Compressor', location: 'Workshop', rated_power: 4.0, description: 'Air supply compressor', user_id: userIds['student@powereye.com'] },
            { name: 'Generator G1', model: 'Diesel Generator DG-750', type: 'Generator', location: 'Backup Room', rated_power: 7.5, description: 'Emergency power backup', user_id: userIds['student@powereye.com'] },
            { name: 'Furnace Unit', model: 'Industrial Furnace F-1200', type: 'Furnace', location: 'Heating Section', rated_power: 12.0, description: 'Industrial furnace for processing', user_id: userIds['student@powereye.com'] },
            
            // Kaviya machines (user_id=6)
            { name: 'Conveyor Belt A', model: 'Modular Conveyor CB-100', type: 'Conveyor', location: 'Production Line 1', rated_power: 2.2, description: 'Main production conveyor', user_id: userIds['kaviya@powereye.com'] },
            { name: 'Drill Press', model: 'CNC Drill DP-3000', type: 'Drill', location: 'Machine Shop', rated_power: 5.0, description: 'Precision drilling machine', user_id: userIds['kaviya@powereye.com'] },
            { name: 'Press Machine', model: 'Hydraulic Press HP-200', type: 'Press', location: 'Manufacturing', rated_power: 8.5, description: 'Heavy duty press machine', user_id: userIds['kaviya@powereye.com'] }
        ];

        let machineInserted = 0;

        machinesData.forEach(machine => {
            const sql = 'INSERT INTO machines (name, model, type, location, rated_power, description, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [machine.name, machine.model, machine.type, machine.location, machine.rated_power, machine.description, 'active', machine.user_id], (err, results) => {
                if (err) {
                    console.error(`❌ Error inserting machine ${machine.name}:`, err.message);
                } else {
                    console.log(`✅ Machine inserted: ${machine.name} (User ID: ${machine.user_id})`);
                }
                machineInserted++;

                if (machineInserted === machinesData.length) {
                    console.log('\n✅ Database initialization complete!\n');
                    console.log('📊 Summary:');
                    console.log('  - 3 Users created');
                    console.log('  - 8 Machines distributed');
                    console.log('\n🔐 Login Credentials:');
                    console.log('  Admin:   admin@powereye.com / admin123');
                    console.log('  Student: student@powereye.com / student123');
                    console.log('  Kaviya:  kaviya@powereye.com / kaviya123\n');
                    db.end();
                    process.exit(0);
                }
            });
        });
    }
});