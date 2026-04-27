console.log("SETTINGS MANAGER LOADED");
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem('gamewise-theme');
    if (savedTheme) {
        applySettings({ theme: savedTheme });
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) return;

        const db = firebase.database();

        db.ref('users/' + user.uid + '/settings').once('value')
        .then(snapshot => {
            const settings = snapshot.val();
            if (!settings) return;

            if (settings.theme) {
                localStorage.setItem('gamewise-theme', settings.theme);
            }
            applySettings(settings);
        });
    });

});

function applySettings(settings) {

    // THEME
    const theme = settings.theme || 'default';

    const themes = ['default', 'dark', 'light', 'purple'];
    document.body.classList.remove(...themes.map(t => t + '-theme'));
    document.querySelector('header')?.classList.remove(...themes.map(t => t + '-theme'));
    document.querySelector('.sidebar')?.classList.remove(...themes.map(t => t + '-theme'));

    if (theme !== 'default') {
        document.body.classList.add(theme + '-theme');
        document.querySelector('header')?.classList.add(theme + '-theme');
        document.querySelector('.sidebar')?.classList.add(theme + '-theme');
    }

    // FONT SIZE
    if (settings.fontSize) {
        document.documentElement.style.fontSize =
            settings.fontSize === 'small' ? '14px' :
            settings.fontSize === 'large' ? '18px' : '16px';
    }

    // ANIMATIONS
    if (settings.animations === false) {
        document.body.classList.add('no-animations');
    }

    console.log("Settings applied:", settings);
}