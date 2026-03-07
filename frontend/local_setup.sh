#!/bin/sh

echo "===================================" 
echo "Setting up local environment variables"
echo "==================================="
cd .. 

if [ -d '.venv' ]; 
then 
    echo "Virtual environement already exists. Skipping creation."
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi      

echo "Activating virtual environment..."
. .venv/bin/activate

echo "installing npm dependencies for frontend"
cd frontend
npm install
cd ..

echo "Installing dependencies for backend"
cd backend
pip install --upgrade pip
pip install -r requirements.txt
cd .. 
npx expo install @react-native-async-storage/async-storage

echo "Local environment setup complete!"