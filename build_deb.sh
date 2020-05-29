#!/bin/sh
# .deb builder by PANCHO7532
# Copyright (c) P7COMunications LLC 2020
# The following script will build a fresh and clean .deb ready for install
# And yeah, sorry for my fucking bad skill at shell scripting but i wanted to do something pretty

# Setting up some variables
P7BUILD_PROJECT_NAME="userbackupjs"
P7BUILD_FLD="debstage"
P7BUILD_OUTPUTDIR="build"
P7BUILD_DEBRESOURCES="debrsrc"
P7BUILD_DEBDOCSHR="debshrdoc"
# Checking directory structure and building if not
if [ ! -d $P7BUILD_FLD ]; then
    echo "[INFO] - Building directory structure..."
    mkdir $P7BUILD_FLD
    mkdir $P7BUILD_FLD/DEBIAN
    mkdir $P7BUILD_FLD/usr
    mkdir $P7BUILD_FLD/usr/lib
    mkdir $P7BUILD_FLD/usr/lib/$P7BUILD_PROJECT_NAME
    mkdir $P7BUILD_FLD/usr/share
    mkdir $P7BUILD_FLD/usr/share/doc 
    mkdir $P7BUILD_FLD/usr/share/doc/$P7BUILD_PROJECT_NAME
fi
if [ ! -d $P7BUILD_OUTPUTDIR ]; then
    mkdir $P7BUILD_OUTPUTDIR
fi
echo "[INFO] - Copying files..."
if [ ! -d $P7BUILD_DEBRESOURCES ]; then
    echo "[ERROR] - Debian resources not found, source incomplete!"
    exit 1;
fi
cp -R $P7BUILD_DEBRESOURCES/. $P7BUILD_FLD/DEBIAN
cp -R $P7BUILD_DEBDOCSHR/. $P7BUILD_FLD/usr/share/doc/$P7BUILD_PROJECT_NAME
cp userbackupjs.sh $P7BUILD_FLD/usr/lib/$P7BUILD_PROJECT_NAME/launcher.sh
cp userBackup_main.js $P7BUILD_FLD/usr/lib/$P7BUILD_PROJECT_NAME
echo "[INFO] - Rebuilding information (superuser required)..."
sudo gzip -9 -n ./$P7BUILD_FLD/usr/share/doc/$P7BUILD_PROJECT_NAME/changelog.Debian
sudo chmod 0755 -R ./$P7BUILD_FLD/DEBIAN
sudo chmod 0755 -R ./$P7BUILD_FLD/usr
sudo chmod +x -R ./$P7BUILD_FLD/usr/lib
sudo chmod -x -R ./$P7BUILD_FLD/usr/share/doc/$P7BUILD_PROJECT_NAME/changelog.Debian.gz
sudo chmod -x -R ./$P7BUILD_FLD/usr/share/doc/$P7BUILD_PROJECT_NAME/copyright
sudo chown -R root:0 ./$P7BUILD_FLD
echo "[INFO] - Building .deb package..."
dpkg-deb --build ./$P7BUILD_FLD ./$P7BUILD_OUTPUTDIR/$P7BUILD_PROJECT_NAME.deb
echo "[INFO] - Cleaning up..."
sudo rm -rf ./debstage
echo "[INFO] - Done!"
exit 0
