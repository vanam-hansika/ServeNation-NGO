const https = require('https');

const folderId = '1UPOj4I3mBu_-xTmSeDG0JsWBCgiG7jNT';
const url = `https://drive.google.com/drive/folders/${folderId}`;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        // Look for file IDs in the page source
        const regex = /"id":"([a-zA-Z0-9_-]{25,})"/g;
        let match;
        const ids = new Set();
        while ((match = regex.exec(data)) !== null) {
            ids.add(match[1]);
        }
        console.log('Found IDs:', Array.from(ids));
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
