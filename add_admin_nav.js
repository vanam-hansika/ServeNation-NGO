const fs = require('fs');
const path = require('path');

const files = [
    'index.html', 'about.html', 'works.html',
    'gallery.html', 'contact.html', 'volunteer.html'
];

const adminNavItem = '        <li><a href="admin-login.html" class="nav-link"><i class="fas fa-lock"></i> Admin</a></li>\n';

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the <ul> with class 'nav-menu'
        // Add the admin link before the volunteer link
        const navMenuRegex = /(<ul class="nav-menu"[^>]*>)([\s\S]*?)(<li><a href="volunteer\.html"[^>]*>)/;
        
        if (navMenuRegex.test(content)) {
            // Check if Admin link already exists
            if (!content.includes('href="admin-login.html"')) {
                content = content.replace(navMenuRegex, (match, openingTag, menuItems, volunteerItem) => {
                    return openingTag + menuItems + adminNavItem + volunteerItem;
                });
                fs.writeFileSync(filePath, content);
                console.log(`Updated navigation in ${file}`);
            } else {
                console.log(`Admin link already exists in ${file}`);
            }
        } else {
            console.warn(`Could not find navigation menu in ${file}`);
        }
    }
});
