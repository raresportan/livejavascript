(function () {
    'use strict';

    const init = () => {

        const menu = document.createElement('div');
        menu.id = 'menu';

        const settings = document.createElement('section');
        settings.id = 'settings';

        menu.appendChild(settings);

        const container = document.getElementById('container');
        container.appendChild(menu);

        const menuToggle = document.createElement('button');
        menuToggle.id = 'menuToggle';
        menuToggle.innerText = 'Menu';
        menuToggle.accessKey = 'm';

        const toolbar = document.getElementById('toolbar');
        toolbar.prepend(menuToggle);


        // create toggle buttons for all settings
        const allSettings = window.m3ntor.settings.keys;
        allSettings.map(aSetting => {
            const button = document.createElement('button');
            button.className = 'switch-container';
            button.tabIndex = -1;

            const input = document.createElement('input');
            input.id = `${aSetting}Checkbox`;
            input.type = 'checkbox';
            input.className = 'checkbox';
            input.checked = window.m3ntor.settings[aSetting];
            input.addEventListener('change', e => window.m3ntor.settings[aSetting] = e.target.checked);

            const label = document.createElement('label');
            label.className = 'switch';
            label.htmlFor = input.id;

            let formatted = aSetting.replace(/([a-z](?=[A-Z]))/g, '$1 ');
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
            const text = document.createTextNode(formatted);

            button.appendChild(input);
            button.appendChild(label);
            button.appendChild(text);
            return button;
        }).forEach(aButton => settings.appendChild(aButton))

        console.log('CREATE LOGOUT BUTTON')
        const button = document.createElement('button');
        button.className = 'logout';
        button.innerText = 'Log out';
        button.addEventListener('click', e => {
            const event = new CustomEvent('logoutRequested');
            document.dispatchEvent(event);
        });
        settings.appendChild(button);

        const img = document.createElement('img');
        img.className = 'logo';
        img.src = 'logo.svg';
        img.alt = document.title;
        settings.appendChild(img);

        // split lessons in modules and create the list of modules and the
        // lessons from each module
        let moduleLessonsList;
        let modules = 0;
        const lessons = window.m3ntor.lessons;
        const lessonsData = lessons.getAllLessons().filter(l => l.type === 'code');
        const currentLesson = lessons.current();
        lessonsData.forEach(lesson => {
            if (lesson.moduleName) {
                if (moduleLessonsList) menu.appendChild(moduleLessonsList);

                // module header
                const moduleNameHeader = document.createElement('header');
                moduleNameHeader.innerHTML = lesson.moduleName;
                menu.appendChild(moduleNameHeader);

                // module lessons
                moduleLessonsList = document.createElement('ol');
                moduleLessonsList.start = lesson.index + 1 - modules;
                menu.appendChild(moduleLessonsList);
                modules++;
            } else {
                const li = document.createElement('li');
                if (lesson.index === currentLesson) {
                    li.className = 'selected';
                }
                li.dataset.index = lesson.index;
                li.innerHTML = `<a href='#/${lesson.index + 1}'>${lesson.title}<span>${lesson.subtitle}</span></a>`;
                if (!moduleLessonsList) moduleLessonsList = document.createElement('ol');
                moduleLessonsList.appendChild(li);
            }
        })
        menu.appendChild(moduleLessonsList); // last module lessons

        // highlight current lesson in menu 
        const updateSelectedLessonInMenu = () => {
            const selectedLesson = menu.querySelector('li.selected');
            selectedLesson && selectedLesson.classList.remove('selected');

            const newSelectedLesson = menu.querySelector(`li[data-index="${lessons.current()}"]`);
            if (newSelectedLesson) {
                newSelectedLesson.classList.add('selected');
                const selectedLessonLink = newSelectedLesson.querySelector('a');
                if (selectedLessonLink) selectedLessonLink.focus();
            }
        }

        const closeMenu = () => {
            console.log('close menu')
            menuToggle.classList.remove('isActive');
            menu.classList.remove('isActive');
            menuToggle.focus();
            document.removeEventListener('lessonChanged', closeMenu);
        }

        menuToggle.addEventListener('click', e => {
            if (!menu.classList.contains('isActive')) {
                updateSelectedLessonInMenu();
                document.addEventListener('lessonChanged', closeMenu);
            }
            e.target.classList.toggle('isActive');
            menu.classList.toggle('isActive');
        })

        const keyHandler = (event) => {
            const { keyCode } = event;
            if (keyCode === 27) {
                closeMenu();
            }
        };
        window.addEventListener('keydown', keyHandler);

    }

    document.addEventListener('lessonsLoaded', init);

}())