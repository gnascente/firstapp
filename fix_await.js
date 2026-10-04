const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf-8');

// I will change processMultipleMedia to explicitly return a Promise
// so await processMultipleMedia(...) actually waits for all files to be processed
// AND I will make sure the callback is invoked, OR rewrite handleLogMedia to just use the promise.

code = code.replace(
`async function processMultipleMedia(files, onProgress, callback) {
    if (!files || files.length === 0) return callback([]);
    let processedArray = [];
    for(let file of files) {`,
`async function processMultipleMedia(files, onProgress, callback) {
    return new Promise(async (resolvePromise) => {
        if (!files || files.length === 0) { callback([]); return resolvePromise(); }
        let processedArray = [];
        for(let file of files) {`);

code = code.replace(
`    }
    callback(processedArray);
}`,
`        }
        callback(processedArray);
        resolvePromise(processedArray);
    });
}`);

fs.writeFileSync('public/index.html', code);
console.log('Fixed processMultipleMedia promise');
