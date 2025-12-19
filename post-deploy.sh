#!/bin/bash
# Simple wrapper script for cPanel Git Version Control
# Calls the Node.js deployment script

cd /home/plantzia/repositories/planted
node deploy.mjs
exit $?
