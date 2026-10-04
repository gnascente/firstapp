const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');
const handleLogMedia = code.match(/const handleLogMedia = async \(e\) => \{[\s\S]*?\n\};/)[0];
console.log(handleLogMedia);
