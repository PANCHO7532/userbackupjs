#!/bin/sh
# Launcher for userbackupJS
# Copyright (c) P7COMunications LLC 2020

# And now... the "if" hell lol

if [ -f "/usr/bin/node" ]; then
    if [ -f "./userBackup_main.js" ]; then
        /usr/bin/node ./userBackup_main.js "$@"
        exit 0
    elif [ -f "/usr/lib/userbackupjs/userBackup_main.js"]; then
        /usr/bin/node /usr/lib/userbackupjs/userBackup_main.js "$@"
        exit 0
    else
        echo "[ERROR] - Main script not found!"
        exit 1
    fi
elif [ -f "/usr/local/bin/node" ]; then
    if [ -f "./userBackup_main.js" ]; then
        /usr/local/bin/node ./userBackup_main.js "$@"
        exit 0
    elif [ -f "/usr/lib/userbackupjs/userBackup_main.js"]; then
        /usr/local/bin/node /usr/lib/userbackupjs/userBackup_main.js "$@"
        exit 0
    else
        echo "[ERROR] - Main script not found!"
        exit 1
    fi
elif [ -L "/usr/lib/userbackupjs/node" ]; then
    # Alright, so, we're supposed to reach this point ONLY if the package is installed
    # If not, then not (?)
    if [ -f "/usr/lib/userbackupjs/userBackup_main.js" ]; then
        /usr/lib/userbackupjs/node /usr/lib/userbackupjs/userBackup_main.js "$@"
        exit 0
    else
        echo "[ERROR] - Main script not found!"
        exit 1
    fi
elif [ -L "./node" ]; then
    # And here if we're running it on the same folder than the script
    if [ -f "./userBackup_main.js" ]; then
        ./node ./userBackup_main.js "$@"
        exit 0
    else
        echo "[ERROR] - Main script not found!"
        exit 1
    fi
else
    # And this one needs a litle bit of work but i will figure it out someday
    LOC1=0
    echo "[WARN] - Node.JS not detected!"
    read -p "If installed, please write the full path where Node.JS binary is located: " njspath
    if [ -f $njspath]; then
        if [ -f "./userBackup_main.js" ]; then
            ln -s $njspath $pwd/node > /dev/null
            LOC1=1
        elif [ -f "/usr/lib/userbackupjs/userBackup_main.js" ]; then
            ln -s $njspath /usr/lib/userbackupjs/node > /dev/null
            LOC1=2
        else 
            echo "[INFO] - Main script not found!"
            exit 1
        fi
        if [ "$LOC1" -eq "1" ]; then
            ./node ./userBackup_main.js "$@"
            exit 0
        elif [ "$LOC1" -eq "2" ]; then
            /usr/lib/userbackupjs/node /usr/lib/userbackupjs/userBackup_main.js "$@"
            exit 0
        else
            echo "[ERROR] - Internal error"
            exit 1
        fi
    else
        echo "[ERROR] - Invalid path!"
        exit 1
    fi
fi