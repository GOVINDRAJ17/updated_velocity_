import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            callback(dirPath);
        }
    });
}

walk('./src', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace gray with slate for consistent F1F5F9/0F172A mapping
    content = content.replace(/gray/g, 'slate');
    
    // Specifically replace bg-black and border-black to use slate-900
    content = content.replace(/bg-black/g, 'bg-slate-900');
    content = content.replace(/border-black/g, 'border-slate-900');

    // Also replace from-black to from-slate-900
    content = content.replace(/from-black/g, 'from-slate-900');
    content = content.replace(/to-black/g, 'to-slate-900');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated backgrounds in ${filePath}`);
    }
});
