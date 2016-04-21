# Maffia
Online version of the role playing game maffia. It is supposed to support video in the (not-too-distant) future!

## Installation instructions
The server runs on Node.js, a Javascript library for handling server stuff (surprise!).
To run the server, you will need nodejs and npm. The easiest way on a linux machine is through command line:
*sudo apt-get install nodejs npm*

If the installation was successful, running *npm -v* should print the current version number of npm.
To fetch the dependencies of the project, simply run *npm update* from the repo folder.

## Running the software
Use *node index.js [port]* to start the server. This will make the webpage available at the given port. Default port is 3000.

For example, *node index.js 4837* will make **http://localhost:4837** filled with content. 
