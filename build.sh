#!/bin/zsh

echo Starting build..

rm -R dist/*

cp -R lib dist/
cp -R logos dist/
cp -R gifs dist/

cp *.svg dist/
cp *.png dist/
cp *.jpg dist/

cp manifest.webmanifest dist/
cp sw.js dist/
cp robots.txt /dist

minify styles.css > dist/styles.css
minify home.css > dist/home.css

minify sandbox.html > dist/sandbox.html

minify settings.js evaluation.js lessons.js navigation.js menu.js editor.js quiz.js > dist/editor.js

cp privacy.html dist/privacy.html
cp index.html dist/index.html
cp lessons.html dist/lessons.html
sed -i '' '/settings.js/d' dist/lessons.html
sed -i '' '/evaluation.js/d' dist/lessons.html
sed -i '' '/lessons.js/d' dist/lessons.html
sed -i '' '/navigation.js/d' dist/lessons.html
sed -i '' '/menu.js/d' dist/lessons.html
sed -i '' '/quiz.js/d' dist/lessons.html

node generateToc.js


echo Build done.