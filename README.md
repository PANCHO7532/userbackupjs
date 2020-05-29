# userbackupjs
### Backup and restore your Linux users easily

**WARNING!** This project require that you have Node.JS installed on your system.

## Installation (building a .deb file)

1) Make executable the file deb_build.sh
2) Run `./deb_build.sh` to build an installable .deb package for your system
3) Install the .deb file located in the build directory, in the same folder where it is the script.

## Installation (using the pre-built .deb file)

1) Go to [this link](https://github.com/PANCHO7532/userbackupjs/releases "Download Pre-Built packages for userbackupJS")
2) Open the .deb file by double-clicking it or run `dpkg -i (package name).deb`
3) Nice, you have installed userbackupJS succesfulsly

## Usage (with the .deb installed)

- Type `userbackupjs`, the backup will start automatically and save it under the `backup.json` file located in your $HOME directory.
- Type `userbackupjs --help` for extra commands and arguments.
- Type `userbackupjs -r` to restore the saved backup.json into your machine or `userbackupjs -r -f custombackup.json` for an custom path of your choice.

## Usage (no installation)
### Using Node.JS

Type `node userBackup_main.js`, the backup will start automatically and save the data under 'backup.json' located in your $HOME directory.
Type `node userBackup_main.js --help` for an list of commands and arguments

### Using .sh launcher

1) Make `userbackupjs.sh` executable by typing `chmod +x userbackupjs.sh`
2) Execute `./userbackupjs`, the backup will start automatically and save every user data under 'backup.json' located in your $HOME directory
3) Execute `./userbackupjs --help` for an list of commands and arguments

## FAQ

 (redacted)
