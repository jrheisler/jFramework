@echo off
echo Starting local server on http://localhost:3000 ...
dart pub global run dhttpd --path . --port 3000
pause
