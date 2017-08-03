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
            phonegap clean android
            rm B\&M\ Portal.ipa
            rm bnmportal.apk
            
            clear

            phonegap build ios --device
            xcodebuild -exportArchive -archivePath platforms/ios/B\&M\ Portal.xcarchive -exportPath . -exportOptionsPlist platforms/ios/B\&M\ Portal/B\&M\ Portal-Info.plist

            phonegap build android --release -- --keystore=key.jks --storePassword=latona --alias=bnmkey --password=latona
            zipalign -v 4 platforms/android/build/outputs/apk/android-release.apk bnmportal.apk

            scp B\&M\ Portal.ipa jordan@localwebserver.bedroomsandmore.com:/home/jordan/www/jandwmarketing.com/htdocs/app/ios/bnmportal.ipa
            scp bnmportal.apk jordan@localwebserver.bedroomsandmore.com:/home/jordan/www/jandwmarketing.com/htdocs/app/android/bnmportal.apk
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