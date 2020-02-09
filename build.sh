#!/bin/zsh

echo Staring build

rm -R dist/*

cp -R lib dist/

cp *.png dist/

minify styles.css > dist/styles.css

minify sandbox.html > dist/sandbox.html

minify settings.js evaluation.js lessons.js navigation.js menu.js editor.js quiz.js > dist/editor.js

cp index.html dist/index.html
cp lessons.html dist/lessons.html
sed -i '' '/settings.js/d' dist/lessons.html
sed -i '' '/evaluation.js/d' dist/lessons.html
sed -i '' '/lessons.js/d' dist/lessons.html
sed -i '' '/navigation.js/d' dist/lessons.html
sed -i '' '/menu.js/d' dist/lessons.html
sed -i '' '/quiz.js/d' dist/lessons.html
