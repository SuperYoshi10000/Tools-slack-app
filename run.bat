@echo off

if "%1"=="" goto run
if "%1"=="-h" goto help
if "%1"=="--help" goto help

if "%1"=="-a" (set useargs=1) else if "%1"=="--args" (set useargs=1) else (set useargs=0)

set arg1=%1
if %useargs%==1 goto run
if "%arg1:~0,1%"=="-" goto unknownargs

:unknownargs
echo Unknown option %1
echo Usage: %0 [<options>]
echo For help use: %0 -h
goto end

:help
if "%2"=="" echo Usage: %0 [<options>]
echo Options:
echo -h, --help: Show this help message
goto end

:run
if "%useargs%"==1 (
    echo Running index.ts with arguments %2
    npx tsx index.ts %2
) else (
    echo Running index.ts
    npx tsx index.ts
)

:end