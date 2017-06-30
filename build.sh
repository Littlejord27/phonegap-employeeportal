#!/bin/bash
if [ "$#" -gt 0 ] 
    then
    if [ "$1" == "dir" ]
        then
            cd ~/Code/SourceTree/employee_portal
    fi
    if [ "$1" == "app" ]
        then
            phonegap clean ios
            rm B\&M\ Portal.ipa
            phonegap build ios --device
            xcodebuild -exportArchive -archivePath platforms/ios/B\&M\ Portal.xcarchive -exportPath . -exportOptionsPlist platforms/ios/B\&M\ Portal/B\&M\ Portal-Info.plist

            phonegap clean android
            rm bnmportal.apk
            phonegap build android --release -- --keystore=key.jks --storePassword=latona --alias=bnmkey --password=latona
            zipalign -v 4 platforms/android/build/outputs/apk/android-release.apk bnmportal.apk

            scp B\&M\ Portal.ipa jordan@bedroomsandmore.com:/var/www/bedroomsandmore.com/app/ios/bnmportal.ipa
            scp bnmportal.apk jordan@bedroomsandmore.com:/var/www/bedroomsandmore.com/app/android/bnmportal.apk
    fi
    if [ "$1" == "min" ] 
        then
            for i in ~/Code/SourceTree/employee_portal/www/js/*.js
            do 
                minify "$i"
            done
    fi
else
    echo "No arguments supplied"
fi