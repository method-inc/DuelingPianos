#!/bin/bash

curl -F "api_key=WGYT54DCI2NULHZP9" -F "filetype=mp3" -F "track=@$1" "http://developer.echonest.com/api/v4/track/upload"
