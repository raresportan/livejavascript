(function () {
    'use strict';

    /**
     * Reads the current URL (hash) and navigates accordingly.
     */
    const readURL = () => {
        const hash = window.location.hash; // e.g. #/7/1
        const bits = hash.slice(2).split('/');
        return (parseInt(bits[0], 10) - 1) || 0;
    }

    /**
     * Updates the page URL (hash) to reflect the current state.
     */
    const writeURL = slideIndex => {
        if (slideIndex !== undefined) window.location.hash = '/' + (slideIndex + 1);
    }


    /**
     * Updates title and subtitle with lesson data
     * @param {*} lesson 
     */
    const renderLessonTitle = lesson => {
        const lessonTitle = document.getElementById('lessonTitle');
        const lessonSubtitle = document.getElementById('lessonSubtitle');

        const docTitle = document.title;
        if (/\|/g.test(docTitle)) {
            document.title = lesson.title + ' |' + docTitle.split('|')[1]
        }
        else document.title = lesson.title + ' | ' + docTitle;

        lessonTitle.innerText = lesson.title;
        if (lesson.subtitle) {
            lessonSubtitle.innerText = lesson.subtitle;
            lessonSubtitle.style['display'] = 'initial';
        } else {
            lessonSubtitle.style['display'] = 'none';
        }

        if (lesson.edited) {
            const edited = document.createElement('button');
            edited.className = 'edited';
            edited.innerText = 'Reset';
            edited.addEventListener('click', () => window.m3ntor.lessons.restoreCurrent())
            lessonTitle.appendChild(edited);
        }
    }

    /**
     * Update navigation buttons state and window hash
     * @param {*} lessons 
     * @param {*} previousButton 
     * @param {*} nextButton 
     */
    const updateNavigation = (lessons, previousButton, nextButton) => {
        previousButton.disabled = !lessons.hasPrevious();
        nextButton.disabled = !lessons.hasNext();
        writeURL(lessons.current());
    }

    /**
     * Go to next lesson
     * @param {*} lessons 
     */
    const next = lessons => renderLessonTitle(lessons.next());


    /**
     * Go to previous lesson
     * @param {*} lessons 
     */
    const previous = lessons => renderLessonTitle(lessons.previous());


    /**
     * Select lesson based on the window hash
     * @param {*} lessons 
     */
    const showLessonFromHash = lessons => {
        const currentLessonIndex = readURL();
        const currentLesson = lessons.setCurrent(currentLessonIndex);
        renderLessonTitle(currentLesson);
    }


    const init = () => {
        const lessons = window.m3ntor.lessons;
        const previousButton = document.getElementById('previousLesson');
        const nextButton = document.getElementById('nextLesson');
        const updateNav = () => updateNavigation(lessons, previousButton, nextButton);

        nextButton.addEventListener('click', () => {
            next(lessons);
            updateNav();
        });
        previousButton.addEventListener('click', () => {
            previous(lessons);
            updateNav();
        });

        showLessonFromHash(lessons);
        updateNav();
        window.addEventListener('hashchange', () => { showLessonFromHash(lessons); updateNav() }, false);
    }

    document.addEventListener('lessonsLoaded', init);
    document.addEventListener('lessonStatusChanged', e => renderLessonTitle(e.detail));
}())
