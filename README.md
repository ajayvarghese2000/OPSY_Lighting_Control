# Introduction
This is an development tool that allows the control of the cassette and reflection LED's of the Dx000 systems vis a graphical user interface. It is written in electron and uses the serialport node module to communicate with the Dx000 systems.

## Usage
<p align="center">
  <img src="https://i.imgur.com/pEa9o1S.png">
</p>

open the `opsy_lights_control.exe` and you will see this screen. Here you can select what COM port each device is connected to. This should be normally fixed to correct for the machine and normally shouldn't need changing, permanent changes can be made by editing the `config.json` file. (not implemented yet)

You can also select what type of cassette the machine take. This will change the available LED's you can light up. Provided the information is correct, you can now click the `Start Up` button to connect to the machine.

<p align="center">
  <img src="https://i.imgur.com/fsFu501.jpg">
</p>

Once connected, you will see the main control screen. Here you can select the LED's you want to light up and toggle on and off the reflection LED's.

Once you are done, simply close the window to disconnect from the machine and free up the COM ports.

### To Do
- Implement other cassette types and machine types
- Implement a way to save the COM port settings permanently with a config file that can be quick switched

## Installation
This app is build using [NodeJS](https://nodejs.org/en) and [Electron](https://www.electronjs.org/). To get started make sure you have the NodeJS runtime installed on your system. You can download it from [here](https://nodejs.org/en/download/).

Once NodeJS is installed, clone the repository and run the following command in the root directory of the repository:

```bash
npm install
```

This will download and install all the required dependencies for the app.

then you can run the development version of the app using the following command:

```bash
npm start
```

This will start the app in development mode. You can also build a production version of the app using the following command:

```bash
npm run build
```