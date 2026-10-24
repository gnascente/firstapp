const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /const allLogs = await AppDB\.logs\.toArray\(\);\s+const logsToDelete = allLogs\.filter\(log => \{\s+const related = log\.relatedEntities \|\| \[\];\s+return related\.includes\(pinId\);\s+\}\);\s+if \(logsToDelete\.length > 0\) \{\s+for \(const log of logsToDelete\) \{\s+log\.isDeleted = true;\s+log\.updatedAt = Date\.now\(\);\s+await db\.logs\.put\(log\);\s+\}\s+App\.startAutoSyncCheck\(\); \/\/ Trigger sync\s+\}/g;

const replacement = `const allLogs = await AppDB.logs.toArray();
                    const logsToDelete = allLogs.filter(log => {
                        const related = log.relatedEntities || [];
                        return log.originEntityId === pinId || related.some(r => r.id === pinId);
                    });

                    if (logsToDelete.length > 0) {
                        for (const log of logsToDelete) {
                            log.isDeleted = true;
                            log.updatedAt = Date.now();
                            await AppDB.logs.put(log);
                        }
                        App.startAutoSyncCheck(); // Trigger sync
                    }`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/index.html', html);
