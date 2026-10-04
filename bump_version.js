const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

code = code.replace(/v 4\.8\.17/g, 'v 4.8.18');

fs.writeFileSync('public/index.html', code);
console.log('Bumped version');
