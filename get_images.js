const https = require('https');
const fs = require('fs');
const path = require('path');

const searches = [
  { term: "Indian village school children", filename: "project-education.png" },
  { term: "Langar food distribution India", filename: "project-food.png" },
  { term: "India tree plantation volunteer", filename: "project-environment.png" },
  { term: "Indian volunteers working", filename: "team-photo.png" },
  { term: "Indian celebration festival crowd", filename: "gallery-event.png" },
  { term: "India community helping", filename: "hero-banner.png" }
];

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ServeNationScript/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'ServeNationScript/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  const dir = path.join(__dirname, 'assets', 'images');
  for (const item of searches) {
    try {
      console.log(`Searching for: ${item.term}`);
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(item.term)}&srnamespace=6&format=json&srlimit=1`;
      const searchData = await fetchJSON(searchUrl);
      if (!searchData.query.search.length) {
        console.log(`No results for ${item.term}, trying fallback...`);
        continue;
      }
      const title = searchData.query.search[0].title;
      console.log(`Found image title: ${title}`);
      
      const imgInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
      const infoData = await fetchJSON(imgInfoUrl);
      const pages = infoData.query.pages;
      const pageId = Object.keys(pages)[0];
      const imgUrl = pages[pageId].imageinfo[0].url;
      
      console.log(`Downloading ${imgUrl} to ${item.filename}`);
      await downloadImage(imgUrl, path.join(dir, item.filename));
      console.log(`Successfully downloaded ${item.filename}`);
    } catch (e) {
      console.error(`Error processing ${item.term}: ${e.message}`);
    }
  }
}

run();
