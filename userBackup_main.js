#!/usr/bin/node
/*
* userbackupJS v3.5.1-4
* Copyright (c) P7COMunications LLC 2020
* Check the LICENSE file on https://github.com/PANCHO7532/userbackupjs for more info about licensing and usage.
*/
const fs = require("fs");
const os = require("os");
const cproc = require('child_process');
const util = require('util'); //for debug more things
if(os.platform() != "linux") {
    console.log("[ERROR] - This script is only for linux.");
    process.exit();
}
const startUID = 1000; //ID where the backup should start reading users, ex: the first user
var passwdFile = "/etc/passwd";
var shadowFile = "/etc/shadow";
var userPasswdCount = 0; //counter of processed combos
var userCount = 0; //counter of valid users specified by startUID;
var miscCount = 0; //uwu
var showHelp = false;
var showVersion = false;
var outputFileContent = {} //where all the content that should be writed to backup.dat should go
outputFileContent["userScript"] = [];
outputFileContent["userPassCombo"] = [];
outputFileContent["miscScripts"] = [];
/*
* customShell:
* 0: t/f - use shell in file
* 1: t/f - use argv shell (if false it will be /bin/false)
* 2: val - custom shell from argv
*/
var customShell = [true, false, "/bin/false"];
/*
* homeCreation:
* 0: t/f - use homedir in file
* 1: t/f - if false, it will create the backup without home directory, if true, will use argv content
* 2: val - custom home dir by argv
*/
var homeCreation = [true, false, "/home/defl"];
var restoreMode = false;
var noComments = false;
var backupUID = false;
var overrideUID = false;
var addMinDays = false;
var addMaxDays = false;
var addWarnDays = false;
var addInactiveDays = false;
var ignoreExpireDate = false;
var backupFile = require('os').homedir() + "/backup.json";
//reading arguments...
for(c = 0; c < process.argv.length; c++) {
    switch(process.argv[c]) {
        case "--help":
        case "-h":
            showHelp = true;
            break;
        case "--version":
        case "-v":
            showVersion = true;
            break;
        case "--restore":
        case "-r":
            restoreMode = true;
            break;
        case "--noOriginalShell":
        case "-nS":
            customShell[0] = false;
            break;
        case "--customShell":
        case "-cS":
            customShell[1] = true;
            if(process.argv[c+1].substring(0, 1) != "/") {
                console.log("[WARN] - Provided custom shell may not be valid, using /bin/false instead.");
                customShell[1] = false;
            } else {
                customShell[2] = process.argv[c+1];
            }
            break;
        case "--noOriginalHome":
        case "-nH":
            homeCreation[0] = false;
            break;
        case "--customHome":
        case "-cH":
            homeCreation[1] = true;
            if(process.argv[c+1].substring(0, 1) != "/") {
                console.log("[WARN] - Provided custom home directory may not be valid, falling back to no-home creation.");
                homeCreation[1] = false;
            } else {
                homeCreation[2] = process.argv[c+1];
            }
            break;
        case "--noComments":
        case "-nC":
            noComments = true;
            break;
        case "--backupUID":
        case "-bU":
            backupUID = true;
            break;
        case "--overrideUID":
        case "-oU":
            overrideUID = true;
            break;
        case "--addMinDays":
        case "-mD":
            addMinDays = true;
            break;
        case "--addMaxDays":
        case "-Md":
            addMaxDays = true;
            break;
        case "--addWarnDays":
        case "-wD":
            addWarnDays = true;
            break;
        case "--addInactiveDays":
        case "-iD":
            addInactiveDays = true;
            break;
        case "--ignoreExpireDate":
        case "-iE":
            ignoreExpireDate = true;
            break;
        case "--backupFile":
        case "-f":
            backupFile = process.argv[c+1];
            break;
        case "--passwdFile":
        case "-pF":
            if(fs.existsSync(process.argv[c+1])) {
                passwdFile = process.argv[c+1];
                break;
            } else {
                console.log("[WARN] - Invalid passwd file/path, falling back to default path...");
                break;
            }
        case "--shadowFile":
        case "-sF":
            if(fs.existsSync(process.argv[c+1])) {
                shadowFile = process.argv[c+1];
                break;
            } else {
                console.log("[WARN] - Invalid shadow file/path, falling back to default path...");
                break;
            }
        default:
            if(process.argv[c].substring(0, 1) == "-" || process.argv[c].substring(0, 2) == "--") {
                console.log("[ERROR] - Invalid argument: \"" + process.argv[c] + "\"");
                showHelp = true;
            }
            break;
    }
}
try {
    fs.accessSync(passwdFile, fs.R_OK);
    fs.accessSync(shadowFile, fs.R_OK);
} catch(err) {
    console.log("[ERROR] - There was an error while reading '" + err["path"] + "', code: " + err["code"]);
    process.exit();
}
const passwdFileContent = fs.readFileSync(passwdFile).toString();
const shadowFileContent = fs.readFileSync(shadowFile).toString();
if(showHelp) {
    //so, we store the help message in a very fashioned way for my eyes
    var helpMessage = [
        "Usage: userbackupjs [options]", 
        "       node script.js [options]",
        "\t  ./script.js [options]",
        "\r\n\-h, --help\t\t\tShow this help",
        "-v, --version\t\t\tShow the version of this script and other misc info",
        "-f, --backupFile\t\tSpecify an custom backup name/absolute path and name (default: " + process.env.HOME + "/backup.json)",
        "-r, --restore\t\t\tRestore an backup file to system",
        "-pF, --passwdFile\t\tSet an custom passwd file location (default: /etc/passwd)",
        "-sF, --shadowFile\t\tSet an custom shadow file location (default: /etc/shadow)",
        "-nS, --noOriginalShell\t\tDo not add original shell info for all accounts",
        "-cS, --customShell\t\tAdd custom shell info for all accounts",
        "-nH, --noOriginalHome\t\tDo not add original homedir info for all accounts",
        "-cH, --customHome\t\tAdd custom homedir for all accounts",
        "-nC, --noComments\t\tDo not include custom comments or any about info from passwd file",
        "-bU, --backupUID\t\tBackup actual UID of the user",
        "-oU, --overrideUID\t\tOverride useradd UID conflict if any on all accounts",
        "-mD, --addMinDays\t\t[chage] - Add MIN_DAYS value from shadow file",
        "-Md, --addMaxDays\t\t[chage] - Add MAX_DAYS value from shadow file",
        "-wD, --addWarnDays\t\t[chage] - Add warning days before pass change from shadow file",
        "-iD, --addInactiveDays\t\t[chage] - Add inactive days value from shadow file",
        "-iE, --ignoreExpireDate\t\t[chage] - Ignore expire date value (if any) stored in passwd file",
        "",
        "Some commands make effect to all accounts stored in backup, so, take care on the options."
    ];
    for(c=0; c < helpMessage.length; c++) {
        console.log(helpMessage[c]);
    }
    process.exit();
}
if(showVersion && !showHelp) {
    var versionMessage = [
        "userbackupjs for Linux v3.5.1-4",
        "Copyright (c) 2020 P7COMunications LLC",
        "License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>.",
        "This is free software: you are free to change it's behaviour and redistribute",
        "Source Code: https://github.com/PANCHO7532/userbackupjs",
        "",
        "View help and usage instructions by re-executing this program with --help args"
    ];
    for(c=0; c < versionMessage.length; c++) {
        console.log(versionMessage[c]);
    }
    process.exit();
}
console.log("[INFO] - Preparing...");
const storage1 = passwdFileContent.split("\n");
const storage2 = shadowFileContent.split("\n");
/*
* Alright, so, we need to rewrite the backup utility to also restore the goddamn backup file in one script
* and economize writing more documentation and... that sort of things
*/
if(restoreMode) {
    //here is where the fun begins... and the pain
    //before we start, let me say first that this was made while i was being a bit asleep so pls sorry for the following shit
    //first we check if the goddamn file exists...
    var warn1 = false;
    try {
        fs.existsSync(backupFile);
        fs.accessSync(backupFile, fs.R_OK);
    } catch(err) {
        //then we exit if the mf doesn't exists or we don't have a read permission
        console.log("[ERROR] - There was an error while reading '" + err["path"] + "', code: " + err["code"]); //dat copypaste lol
        process.exit();
    }
    //and, we finally parse it...
    var st1 = JSON.parse(fs.readFileSync(backupFile).toString());
    var execErrors = "" //for storing errors
    //oh boi, here we go
    console.log("[INFO] - Restoring from: " + backupFile + "...");
    for(c = 0; c < st1["userScript"].length; c++) {
        //executing user creation scripts
        try {
            cproc.execSync(st1["userScript"][c], {stdio: "ignore"});
        } catch(error) {
            execErrors += error.message + "\r\n";
            warn1 = true;
        }
    }
    if(warn1) {
        console.log("[WARN] - One or more commands failed in userScript task, restore may be unclean.");
        warn1 = false;
    }
    for(c = 0; c < st1["userPassCombo"].length; c++) {
        try {
            cproc.execSync("chpasswd -e", {input: st1["userPassCombo"][c].toString(), encoding: "utf8"});
        } catch(error) {
            execErrors += error.message + "\r\n";
            warn1 = true; //dejavu i was in this place before :music:
        }
    }
    if(warn1) { //bruh
        console.log("[WARN] - One or more commands failed in userPassCombo task, restore may be unclean.");
        warn1 = false;
    }
    if(st1["miscScripts"].length != 0) {
        for(c = 0; c < st1["miscScripts"]; c++) {
            try {
                cproc.execSync(st1["miscScripts"][c], {stdio: "ignore"});
            } catch(error) {
                execErrors += error.message + "\r\n";
                warn1 = true;
            }
        }
        if(warn1) { //bruh x2
            console.log("[WARN] - One or more commands failed in miscScripts task, restore may be unclean.");
            warn1 = false;
        }
    }
    if(execErrors != "") {
        console.log("[INFO] - The following errors were reported:\r\n" + execErrors);
    }
    console.log("[INFO] - Restore complete.")
    //aaaand we finish the script before it does something stupid
    process.exit();
}
/*
* Starting backup process...
*/
console.log("[INFO] - Backing up from UID " + startUID + "...");
for(c = 0; c < storage1.length; c++) {
    //parsing passwd and shadow arrays
    var tmps1 = storage1[c].split(":");
    var tmps2 = storage2[c].split(":");
    if(tmps1[2] >= startUID) {
        var tmpHome = "";
        var tmpShell = "";
        var tmpComments = "";
        var tmpoUID = "";
        var tmpoUIDval = "";
        if(homeCreation[0]) {
            if(fs.existsSync(tmps1[5])) {
                tmpHome = "-m -d " + tmps1[5]; 
            } else {
                tmpHome = "-M -d " + tmps1[5];
            }
        } else if(!homeCreation[0] && !homeCreation[1]) {
            tmpHome = "-M";
        } else if(!homeCreation[0] && homeCreation[1]) {
            tmpHome = "-m -d " + homeCreation[2];
        } else {
            console.log("[ERROR] - There was an error processing application logic, code: HC-ERR");
            process.exit();
        }
        if(customShell[0]) {
            tmpShell = "-s " + tmps1[6];
        } else if(!customShell[0] && !customShell[1]) {
            tmpShell = "-s /bin/false";
        } else if(!customShell[0] && customShell[1]) {
            tmpShell = "-s " + customShell[2]; 
        } else {
            console.log("[ERROR] - There was an error processing application logic, code: SC-ERR");
            process.exit();
        }
        if(!noComments) {
            if(tmps1[4] != "") {
                tmpComments = " -c " + tmps1[4];
            }
        }
        if(overrideUID) {
            tmpoUID = " -o";
        }
        if(backupUID) {
            tmpoUIDval = " -u " + tmps1[2];
        }
        outputFileContent["userScript"][userCount] = "useradd " + tmpHome + " " + tmps1[0] + " " + tmpShell + tmpComments + tmpoUID + tmpoUIDval;
        userCount++;
        //storing user-pass combo
        outputFileContent["userPassCombo"][userPasswdCount] = tmps2[0] + ":" + tmps2[1];
        userPasswdCount++;
        //now, we are going to add some misc info stored in /etc/shadow
        var tmpMinDays = "";
        var tmpMaxDays = "";
        var tmpWarnDays = "";
        var tmpInactiveDays = "";
        var tmpExpireDate = "";
        if(addMinDays) {
            tmpMinDays = " -m " + tmps2[3];
        } 
        if(addMaxDays) {
            tmpMaxDays = " -M " + tmps2[4];
        }
        if(addWarnDays) {
            tmpWarnDays = " -W " + tmps2[5];
        }
        if(addInactiveDays) {
            if(tmps2[6] != "") {
                tmpInactiveDays = " -I " + tmps2[6];
            }
        }
        if(!ignoreExpireDate) {
            if(tmps2[7] != "") {
                tmpExpireDate = " -E " + tmps2[7];
            }
        }
        //generating chage commands
        var tmps3 = "chage" + tmpMinDays + tmpMaxDays + tmpWarnDays + tmpInactiveDays + tmpExpireDate + " " + tmps1[0];
        if(tmps3 != "chage " + tmps1[0]) { //avoiding empty chage commands that would result in useless help info (?)
            outputFileContent["miscScripts"][miscCount] = tmps3;
            miscCount++;
        }
    }
}
fs.writeFileSync(backupFile, JSON.stringify(outputFileContent));
console.log("[INFO] - Backup complete.");
process.exit();