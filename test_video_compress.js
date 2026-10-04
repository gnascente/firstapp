// Let's inspect handleLogMedia where the problem actually manifests.
const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

console.log(code.match(/const handleLogMedia = async \(e\) => \{[\s\S]*?catch\(err\)/)[0]);
