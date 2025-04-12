const readline = require('readline');
const fetch = require('node-fetch');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function makeAdmin() {
    try {
        // Get the API URL
        const apiUrl = await new Promise((resolve) => {
            rl.question('Enter your API URL (e.g., https://your-api.onrender.com): ', (answer) => {
                resolve(answer.trim());
            });
        });

        // Get the user's email
        const email = await new Promise((resolve) => {
            rl.question('Enter the email of the user to make admin: ', (answer) => {
                resolve(answer.trim());
            });
        });

        // Get the setup key
        const setupKey = await new Promise((resolve) => {
            rl.question('Enter your ADMIN_SETUP_KEY: ', (answer) => {
                resolve(answer.trim());
            });
        });

        console.log('\nMaking API request...');

        const response = await fetch(`${apiUrl}/setup-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                setupKey
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Success!');
            console.log('User has been made an admin:');
            console.log(data);
        } else {
            console.log('\n❌ Error:');
            console.log(data.message);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

makeAdmin();
