
/* ########## [ Imports ] ########## */
const { SerialPort } = require('serialport')    // Used to interact with the serial ports
const fs = require('fs');                       // Used to read files from the file system
const alertify = require('alertifyjs');         // Used to display alerts

// Set the path to the current directory this file is in
var currentDirectory = __dirname;

/* ########## [ Globals ] ########## */

// What COM ports the user has selected for the transmission and reflection
var TransmissionCOM = null
var ReflectionCOM = null

// The serial port objects for the transmission and reflection
var transmissionPort = null
var reflectionPort = null

// If the transmission and reflection ports exist used for error checking
var tExists = false
var rExists = false

// The current row that is selected and if the reflection is on or off
var currentTransmission = null
var currentReflection = false

/***
 * @brief Turns on the transmission for the selected row
 * @param row The row that is selected (in the form of a g tag that holds a collection
 * of paths from the selected SVG file)
 * @return None
 * @note This function is called when a row is clicked
*/
function TransmissionOn(row) 
{
    // If there is a current transmission, switch the selected colour off
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

    // Debug message should output the id of the row which should be the 2^x value
    console.log(row.id)

    // Send the transmission command to the COM port
    transmissionPort.write(row.id + ",100")
}


/***
 * @brief Turns on the reflection
 * @param None
 * @return None
 * @note This function is called when the reflection button is clicked
*/
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


/***
 * @brief Sets up all the click events for the selected cassette
 * @param None
 * @return None
 * @note This function is called after the COM ports have been verified. It makes 
 * the cassette visible and sets up all the click events for the cassette to call
 * the correct functions when clicked.
*/
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

/***
 * @brief Imports the cassette into the html
 * @param type The type of cassette to import
 * @return None
 * @note This function is called after the COM ports have been verified. It will
 * add the correct cassette svg to the html. Normally this will change depending
 * on the cassette type. However, for this prototype it will always be the
 * Jericho cassette.
 * @todo Add the other cassette types
*/
function importCassette(type) 
{
    // get the element with class OpsyNormal
    var cassette = document.getElementsByClassName("OpsyNormal");

    // read the svg file into memory
    var svgString = fs.readFileSync(`${currentDirectory}/assets/images/OPSY_Normal.svg`, "utf8");

    // import the cassette file directly into the html
    cassette[0].innerHTML = svgString;

    // import the reflection image into the html
    var reflection = document.getElementsByClassName("Reflection_Button");
    reflection[0].innerHTML = fs.readFileSync(`${currentDirectory}/assets/images/reflection.svg`, "utf8");

    // By default hide the reflection light icon will show in the 'on' state turning it off on boot
    hideObjectiveLightBeam()
}

/***
 * @brief Hides the objective light beam from the UI
 * @param None
 * @return None
 * @note This function is called when the reflection is turned off
*/
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

/***
 * @brief Shows the objective light beam from the UI
 * @param None
 * @return None
 * @note This function is called when the reflection is turned on
*/
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

/***
 * @brief Starts the setup process
 * @param None
 * @return None
 * @note This function is called when the start up button is clicked. It will
 * verify the COM ports and then start the setup process.
*/
function start_setup()
{
    // Scan the COM ports this returns a promise so it will only continue if the ports are valid
    serialPortScan().then((message) => {
        
        // Connect to the COM ports
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
        
        // Import the cassette
        importCassette()

        // Setup the click events
        setupClickEvents()

    }).catch((error) => { // If the ports are invalid display an error
        alertify.error(error)
    })
}

/***
 * @brief Connects to the transmission COM port
 * @param None
 * @return None
 * @note This function is called when the start up button is clicked. It assumes the
 * COM ports have been verified and will open the COM port with a baud rate of 9600.
*/
function connectToTransmission()
{
    // Connect to the transmission port
    transmissionPort = new SerialPort({path: TransmissionCOM,  baudRate: 9600 })  

}

/***
 * @brief Connects to the reflection COM port
 * @param None
 * @return None
 * @note This function is called when the start up button is clicked. It assumes the
 * COM ports have been verified and will open the COM port with a baud rate of 9600.
*/
function connectToReflection()
{
    // Connect to the reflection port
    reflectionPort = new SerialPort({path: ReflectionCOM,  baudRate: 9600 })
}

/***
 * @brief Scans the COM ports and verifies the ports exist
 * @param None
 * @return None
 * @note This function is called when the start up button is clicked. It will
 * scan the COM ports and verify the ports exist. It will also verify that the
 * ports are not the same.
 * @warning Although this checks that the COM ports exist it does not check if
 * they are the correct COM ports. The user could select valid COM ports that are
 * for other devices.
*/
function serialPortScan()
{
    return new Promise((resolve, reject) => {

        // get the transmission port selected
        var transmissionPort = document.getElementsByName("tport")[0].value;

        // get the reflection port selected
        var reflectionPort = document.getElementsByName("rport")[0].value;

        // Set the global variables
        TransmissionCOM = transmissionPort
        ReflectionCOM = reflectionPort
        
        // Debug message
        console.log(TransmissionCOM)
        console.log(ReflectionCOM)

        // Check if the ports specified are valid (not the same and not empty)
        if (TransmissionCOM == "" || ReflectionCOM == "" || TransmissionCOM == ReflectionCOM)
        {
            // If not valid throw an error
            console.log("Invalid ports")
            
            // reject the promise
            reject("Invalid ports")
        }
        
        // Loop through all the ports and check if the ports exist on the system
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

                // reject the promise
                reject("Ports do not exist")
            }
            else // Both ports exist and are not the same
            {
                // resolve the promise
                resolve("Ports exist")
            }
        })
    })
}

// add an even listener for the start button
var start = document.getElementById("start");
start.addEventListener("click", function() {
    start_setup();
});