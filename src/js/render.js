const { SerialPort } = require('serialport')
const fs = require('fs');
const alertify = require('alertifyjs');


var TransmissionCOM = null
var ReflectionCOM = null

var transmissionPort = null
var reflectionPort = null

var tExists = false
var rExists = false

var currentTransmission = null
var currentReflection = false


function TransmissionOn(row) 
{
    // If there is a current transmission, switch the colour to white
    if (currentTransmission != null) 
    {
        // Get all the paths in the current transmission
        var paths = currentTransmission.getElementsByTagName("path");

        // Loop through all the paths and set the color to white
        for (var i = 0; i < paths.length; i++) {
            paths[i].style.fill = "white";
        }
    }

    // If the current transmission is the same as the row, switch off
    if (currentTransmission == row)
    {
        currentTransmission = null;

        // Get all the paths in the current transmission
        var paths = currentTransmission.getElementsByTagName("path");

        // Loop through all the paths and set the color to white
        for (var i = 0; i < paths.length; i++) {
            paths[i].style.fill = "white";
        }

        // Send the transmission command to the COM port
        transmissionPort.write(row.id + ",000")

        return;
    }


    // Set the color of all paths in the row to green
    var paths = row.getElementsByTagName("path");
    
    for (var i = 0; i < paths.length; i++) {
        paths[i].style.fill = "#66b069";
    }

    // Set the current transmission to the row
    currentTransmission = row;

    console.log(row.id)

    // Send the transmission command to the COM port
    transmissionPort.write(row.id + ",100")
}

function reflectionToggle()
{
    // Update the UI
    if (currentReflection == false)
    {
        // Set the reflection to true
        currentReflection = true;

        // Send the reflection command to the COM port
        reflectionPort.write("c0,r0,d100")

        // Turn on the reflection
        showObjectiveLightBeam()
    }
    else
    {
        // Set the reflection to false
        currentReflection = false;

        // Send the reflection command to the COM port
        reflectionPort.write("c0,r0,d000")

        // Turn off the reflection
        hideObjectiveLightBeam()
    }

}

function setupClickEvents() {
    
    // Get the cassette object
    var cassette = document.getElementById("cassette");

    // Get all the g tags in the cassette
    var gTags = cassette.getElementsByTagName("g");

    // Loop through all the g tags to add events
    for (var i = 0; i < gTags.length; i++) 
    {
        // Get the current g tag
        var gTag = gTags[i];

        // Add a click event to every g tag which passes the id to switch on the light
        gTag.addEventListener("click", function() {
            TransmissionOn(this);
        });

        // Add a hover event to every g tag which adds a border of green to the svg paths
        gTag.addEventListener("mouseover", function() {
            var paths = this.getElementsByTagName("path");
            for (var i = 0; i < paths.length; i++) {
                paths[i].style.stroke = "#66b069";
                paths[i].style.strokeWidth = "3px";
            }
        });

        // Add a hover event to every g tag which removes the border of green to the svg paths
        gTag.addEventListener("mouseout", function() {
            var paths = this.getElementsByTagName("path");
            for (var i = 0; i < paths.length; i++) {
                paths[i].style.stroke = "none";
            }
        });

    }

    // Click event for the reflection button
    var reflection = document.getElementsByClassName("Reflection_Button");
    reflection[0].addEventListener("click", function() {
        reflectionToggle();
    });
}

function importCassette(type) 
{
    // get the element with class OpsyNormal
    var cassette = document.getElementsByClassName("OpsyNormal");

    // read the svg file into memory
    var svgString = fs.readFileSync("./src/assets/images/OPSY_Normal.svg", "utf8");

    // import the cassette file directly into the html
    cassette[0].innerHTML = svgString;

    // import the reflection image into the html
    var reflection = document.getElementsByClassName("Reflection_Button");
    reflection[0].innerHTML = fs.readFileSync("./src/assets/images/reflection.svg", "utf8");

    hideObjectiveLightBeam()
}

function hideObjectiveLightBeam() 
{
    // get the g element with id Light
    var light = document.getElementById("Light");

    // hide all the paths in the g element
    var paths = light.getElementsByTagName("path");
    for (var i = 0; i < paths.length; i++) {
        paths[i].style.fill = "none";
    }
}

function showObjectiveLightBeam() 
{
    // get the g element with id Light
    var light = document.getElementById("Light");

    // show all the paths in the g element
    var paths = light.getElementsByTagName("path");
    for (var i = 0; i < paths.length; i++) {
        paths[i].style.fill = "#FAFF00";
    }
}


function start_setup()
{
    try 
    {
        serialPortScan()

        // Sanity check that the ports exist
        if (tExists == false || rExists == false)
        {
            throw new Error("Ports do not exist")
        }
    }
    catch (error)
    {
        console.log(error)
        alertify.error("Ports do not exist")
        return;
    }

    connectToTransmission()
    connectToReflection()
    
    // Animate out the setup screen
    var setup = document.getElementById("setupBox");
    setup.classList.add('animate__animated', 'animate__bounceOutLeft');
    
    // Animate in the cassette screen
    var cassette = document.getElementsByClassName("OpsyNormal");
    // change visibility to visible
    cassette[0].style.visibility = "visible";
    cassette[0].classList.add('animate__animated', 'animate__bounceInRight');

    // Animate in the reflection button
    var reflection = document.getElementsByClassName("Reflection_Button");
    // change visibility to visible
    reflection[0].style.visibility = "visible";
    reflection[0].classList.add('animate__animated', 'animate__bounceInLeft');
    
    importCassette()
    setupClickEvents()
}

function connectToTransmission()
{
    // Connect to the transmission port
    transmissionPort = new SerialPort({path: TransmissionCOM,  baudRate: 9600 })  

}

function connectToReflection()
{
    // Connect to the reflection port
    reflectionPort = new SerialPort({path: ReflectionCOM,  baudRate: 9600 })
}

function serialPortScan()
{
    
    // get the transmission port
    var transmissionPort = document.getElementsByName("tport")[0].value;

    // get the reflection port
    var reflectionPort = document.getElementsByName("rport")[0].value;

    // Set the global variables
    TransmissionCOM = transmissionPort
    ReflectionCOM = reflectionPort

    console.log(TransmissionCOM)
    console.log(ReflectionCOM)

    // Check if the ports specified are valid
    if (TransmissionCOM == "" || ReflectionCOM == "")
    {
        // If not, return
        console.log("Invalid ports")
        return;
    }
    
    // Loop through all the ports and check if the ports exist
    SerialPort.list().then((ports) => {
        ports.forEach((port) => 
        {

            if (port.path == TransmissionCOM)
            {
                tExists = true
            }

            if (port.path == ReflectionCOM)
            {
                rExists = true
            }
        })

         // If the ports do not exist throw an error
        if (tExists == false || rExists == false)
        {
            console.log("Ports do not exist")
            throw new Error("Ports do not exist")
        }
    })

   

}

// add an even listener for the start button
var start = document.getElementById("start");
start.addEventListener("click", function() {
    start_setup();
});