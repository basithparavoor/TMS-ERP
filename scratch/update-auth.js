const fs = require('fs');
let content = fs.readFileSync('auth-service.js', 'utf8');
const oldText = 'if (!session || !session.user) {\r\n        this.currentUser = null;\r\n        this.clearCache();\r\n        return null;\r\n      }';
const newText = 'if (!session || !session.user) {\r\n        const cached = this.readCache();\r\n        if (cached && cached.role) {\r\n          this.currentUser = cached;\r\n          return cached;\r\n        }\r\n        this.currentUser = null;\r\n        this.clearCache();\r\n        return null;\r\n      }';

if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  fs.writeFileSync('auth-service.js', content, 'utf8');
  console.log('auth-service.js updated successfully!');
} else {
  console.log('Target not found in auth-service.js');
}
