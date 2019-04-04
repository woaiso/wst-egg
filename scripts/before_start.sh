#!/usr/bin/env bash

# before app start 

# check thirdpart service is online 

bash ./scripts/wait-for-it.sh --timeout=0 mongodb:27017 -- echo 'mongodb is up'
