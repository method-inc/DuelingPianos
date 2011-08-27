#!/bin/bash

curl -F "api_key=WGYT54DCI2NULHZP9" -F "format=json" -F "id=$1" -F "bucket=audio_summary" "http://developer.echonest.com/api/v4/track/analyze"
