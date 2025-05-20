const express = require('express');
const path = require('path');
const cron = require('node-cron');
const https = require('https');
const app = express();
const port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

cron.schedule('*/14 * * * *', () => {
    https.get(process.env.RENDER_URL || 'https://your-render-app.onrender.com', (res) => {
        console.log(`Pinged server at ${new Date().toISOString()}: Status ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`Ping error: ${err.message}`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});