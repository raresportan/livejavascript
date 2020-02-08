'use strict';

(function () {

    const listener = e => {
        const target = e.target;
        const parent = target.parentNode;
        const allButtons = parent.querySelectorAll('button');
        allButtons.forEach(aButton => aButton.classList.remove('selected'));

        target.classList.add('selected');
    }

    // Update quiz on lesson change
    document.addEventListener('lessonChanged', e => {
        const slideEl = document.getElementById('slide');
        const lesson = e && e.detail;

        const buttons = slideEl.querySelectorAll('.quiz > .options > button');
        buttons.forEach(aButton => {
            lesson.type === 'quiz' ? aButton.addEventListener('click', listener, true) : aButton.removeEventListener('click', listener, true)
        })
    })


}())    