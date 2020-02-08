(function () {
    'use strict';

    let currentLesson = 0;
    let allLessons = 0;
    let lessons;

    const utoa = s => btoa(unescape(encodeURIComponent(s)));
    const atou = s => decodeURIComponent(escape(atob(s)));

    const saveLesson = (lessonTitle, lessonCode) => {
        try {
            let jsLessons = {};
            const savedJSLessons = localStorage.getItem('JSLessons');
            if (savedJSLessons) {
                jsLessons = JSON.parse(atou(savedJSLessons));
            }
            jsLessons[lessonTitle] = lessonCode;
            localStorage.setItem('JSLessons', utoa(JSON.stringify(jsLessons)));
        }
        catch (err) {
            console.error('m3ntor', err);
        }
    }

    const loadLesson = lessonTitle => {
        try {
            let jsLessons = {};
            const savedJSLessons = localStorage.getItem('JSLessons');
            if (savedJSLessons) {
                jsLessons = JSON.parse(atou(savedJSLessons));
            }
            return jsLessons[lessonTitle];
        } catch (err) {
            console.error('m3ntor', err);
        }
    }

    const deleteLesson = lessonTitle => {
        try {
            let jsLessons = {};
            const savedJSLessons = localStorage.getItem('JSLessons');
            if (savedJSLessons) {
                jsLessons = JSON.parse(atou(savedJSLessons));
            }

            jsLessons = Object.keys(jsLessons)
                .filter(key => key !== lessonTitle)
                .reduce((obj, key) => {
                    obj[key] = jsLessons[key];
                    return obj;
                }, {});
            localStorage.setItem('JSLessons', utoa(JSON.stringify(jsLessons)));
        } catch (err) {
            console.error('m3ntor', err);
        }
    }

    const init = () => {
        const lessonNodes = document.querySelectorAll('.lesson');
        const lessonsArray = Array.prototype.slice.call(lessonNodes);
        lessons = lessonsArray.map((aLessonNode, index) => {
            let type = 'code';
            if (aLessonNode.classList.contains('slide')) {
                type = 'slide'
            }
            if (aLessonNode.classList.contains('quiz-slide')) {
                type = 'quiz'
            }
            const lessonTitle = aLessonNode.getAttribute("data-title");
            const customCode = loadLesson(lessonTitle);

            return Object.freeze({
                index,
                type: type,
                code: type === 'code' ? customCode || aLessonNode.innerText : aLessonNode.innerHTML,
                title: lessonTitle,
                subtitle: aLessonNode.getAttribute("data-subtitle") || '',
                moduleName: aLessonNode.getAttribute("data-module") || false,
                edited: !!customCode
            })
        })
        allLessons = lessons.length;

        const event = new CustomEvent('lessonsLoaded', { detail: null });
        document.dispatchEvent(event)
    }



    const lessonChanged = () => {
        const event = new CustomEvent('lessonChanged', { detail: lessons[currentLesson] });
        document.dispatchEvent(event)
    }


    const lessonStatusChanged = () => {
        const event = new CustomEvent('lessonStatusChanged', { detail: lessons[currentLesson] });
        document.dispatchEvent(event)
    }

    const updateCurrentLessonIndex = (newIndex) => {
        if (currentLesson !== newIndex || currentLesson === 0) {
            currentLesson = newIndex;
            lessonChanged();
        }
    }

    const limit = (index, max) => Math.min(Math.max(0, index), max - 1);
    const hasNext = () => currentLesson < allLessons - 1;
    const hasPrevious = () => currentLesson > 0;

    // get next lesson data
    const next = () => {
        if (hasNext()) {
            updateCurrentLessonIndex(limit(currentLesson + 1, allLessons));
        }
        return lessons[currentLesson];
    }

    // get previous lesson data
    const previous = () => {
        if (hasPrevious()) {
            updateCurrentLessonIndex(limit(currentLesson - 1, allLessons));
        }
        return lessons[currentLesson];
    }

    // get current lesson index
    const current = () => currentLesson;

    // set current lesson index
    const setCurrent = c => {
        updateCurrentLessonIndex(limit(c, allLessons));
        return lessons[currentLesson];
    }

    // get all lessons data
    const getAllLessons = () => [...lessons];

    const updateLesson = (changes) => {
        const updatedLessons = [...lessons];
        const updatedLesson = { ...updatedLessons[currentLesson], ...changes };
        // save
        saveLesson(updatedLesson.title, updatedLesson.code);

        Object.freeze(updatedLesson);
        updatedLessons[currentLesson] = updatedLesson;
        Object.freeze(updatedLessons);
        lessons = updatedLessons;


        lessonStatusChanged();
    }

    const restoreCurrent = () => {
        const lessonNodes = document.querySelectorAll('.lesson');
        const lessonsArray = Array.prototype.slice.call(lessonNodes);
        const lesson = lessonsArray[currentLesson];
        const code = lesson.innerText;

        updateLesson({ 'edited': false, 'code': code });
        deleteLesson(lessons[currentLesson].title);
        lessonChanged();
    }

    const updateCurrentCode = (code) => {
        if (lessons[currentLesson].type === 'code' && lessons[currentLesson].code !== code) {
            updateLesson({ 'edited': true, 'code': code });
        }
    }

    window.m3ntor = window.m3ntor || {};
    window.m3ntor.lessons = {
        hasNext: hasNext,
        hasPrevious: hasPrevious,
        next: next,
        previous: previous,
        current: current,
        setCurrent: setCurrent,
        getAllLessons: getAllLessons,
        restoreCurrent: restoreCurrent,
        updateCurrentCode: updateCurrentCode
    }
    Object.freeze(window.m3ntor.lessons);

    window.addEventListener('load', init);
}())