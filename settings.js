'use strict';

(function () {

    const allSettings = {
        'darkMode': window.matchMedia('(prefers-color-scheme: dark)') && window.matchMedia('(prefers-color-scheme: dark)').matches,
        'infiniteLoopProtection': true
    }


    // Keeps settings in a single place so they can be accessed 
    // all over the code
    const storageHandler = {
        // get setting from storage
        get: (_, prop) => {
            try {
                if (prop === 'keys') {
                    return Object.keys(allSettings);
                } else {
                    return JSON.parse(localStorage.getItem(prop));
                }
            }
            catch (err) {
                console.error('m3ntor', err);
            }
        },
        // save setting in storage
        set: (_, prop, val) => {
            try {
                if (prop !== 'keys') {
                    localStorage.setItem(prop, JSON.stringify(val));
                    const event = new CustomEvent('settingsChange', { detail: { setting: prop, value: val } });
                    document.dispatchEvent(event)
                }
            }
            catch (err) {
                console.error('m3ntor', err);
            }
            return true;
        }
    };

    window.m3ntor = window.m3ntor || {};
    window.m3ntor.settings = new Proxy({}, storageHandler);


    // initialize all settings with default values
    Object.keys(allSettings).forEach(aSettingKey => {
        let savedValue = window.m3ntor.settings[aSettingKey];
        if (savedValue === undefined || savedValue === null) {
            window.m3ntor.settings[aSettingKey] = allSettings[aSettingKey];
        }
    })
}())