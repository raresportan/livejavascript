#!/bin/zsh

set -e
echo Starting build..

rm -R dist/*

cp -R lib dist/
cp -R logos dist/

mkdir dist/gifs
cp gifs/*.mp4 dist/gifs/
cp gifs/*.webm dist/gifs/

cp *.svg dist/
cp *.png dist/
cp *.jpg dist/

cp manifest.webmanifest dist/
cp sw.js dist/
cp robots.txt dist/

# https://www.npmjs.com/package/minify (pinned: v14 produces a broken editor.js)
npx --yes minify@6.0.1 styles.css > dist/styles.css
npx --yes minify@6.0.1 home.css > dist/home.css

npx --yes minify@6.0.1 sandbox.html > dist/sandbox.html

npx --yes minify@6.0.1 settings.js evaluation.js lessons.js navigation.js menu.js editor.js quiz.js > dist/editor.js

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