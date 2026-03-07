#!/bin/sh

echo "====================================" 
echo "Running your application locally" 
echo "-----------------------------------" 

cd .. 


if [ -d '.venv' ]
then 
    echo "local environment found" 
else 
    echo "no local environment found, please run local_setup.sh first" 
    exit 1
fi 

echo "Activating the local environment" 
. .venv/bin/activate 

cd backend
cd app 

echo "running your application" 
python3 main.py 