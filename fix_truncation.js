const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

// Replace "header h1 span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }"
// with "header h1 span { white-space: normal; overflow: visible; text-overflow: unset; line-height: 1.1; display: inline-block; word-break: break-word; }"

code = code.replace(
    `header h1 span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`,
    `header h1 span { white-space: normal; overflow: visible; text-overflow: unset; line-height: 1.1; display: inline-block; word-break: break-word; }`
);

fs.writeFileSync('public/index.html', code);
console.log('Fixed truncation');
