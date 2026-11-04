const fs = require('fs');
const files = ['tpsh_rbac_all.js', 'tpsh_users_complete.js', 'tpsh_users_page.js', 'tpsh_users_early.js', 'rbac_service_complete.js', 'modal_inspect.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        const text = fs.readFileSync(f, 'utf8');
        const i = text.indexOf('boys_mentor:');
        console.log(f, 'has boys_mentor: at:', i);
        if (i !== -1) {
            console.log(text.substring(Math.max(0, i - 150), i + 250));
        }
    }
});
