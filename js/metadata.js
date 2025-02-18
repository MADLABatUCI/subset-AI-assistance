/*
metadata.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Experiment metadata.

This file should contain static experimental metadata such as:
    - Debug Status
    - Experiment Name
    - Experiment Database Name
    - 
    - 
*/

/******************************************************************************
*   IMPORTS
******************************************************************************/
/// Importing functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    writeURLParameters,
    firebaseUserId
} from "./firebasepsych1.0.js";

import {
    setText,
    placeImage,
    clearContent,
    loadContent,
} from "./utils.js";

/******************************************************************************
*   VARIABLES
******************************************************************************/
// EXPERIMENT METADATA
export var DEBUG = true;
export var EXPERIMENT_NAME = "Subset AI Assistance";
export var EXPERIMENT_DATABASE_NAME = "k-subset-AI-assistance-v01";
if (DEBUG){
        EXPERIMENT_DATABASE_NAME = "DEBUG-" + EXPERIMENT_DATABASE_NAME;
};
export var LEAD_RESEARCHER = "Heliodoro Tejeda";
export var LEAD_RESEARCHER_EMAIL = "htejeda@uci.edu";
export var FACULTY_SPONSOR = "Mark Steyvers";
export var FACULTY_SPONSOR_EMAIL = "mark.steyvers@uci.edu";

// CONTENT FILES
export var CONSENT_FILE = "html/1-consent.html";
export var INSTRUCTIONS_FILE = "html/2-instructions.html";

// UNIVERSITY IMAGES/LOGOS
export var UNIVERSITY_SEAL = "images/uci_seal.png";
export var UNIVERSITY_LOGO_LEFT = "images/BCeater-right.png";
export var UNIVERSITY_LOGO_RIGHT = "images/BCeater-left.png";

// DISPLAY SETTINGS
var UNIVERSITY_HEADER = true;




/******************************************************************************
*   FUNCTIONS
******************************************************************************/
function displayExperimentHeader () {
    /* Display a header based on metadata parameters. */
    if (UNIVERSITY_HEADER) {
        setText("experiment-title", EXPERIMENT_NAME);
        placeImage("university-logo-left", UNIVERSITY_LOGO_LEFT);
        placeImage("university-logo-right", UNIVERSITY_LOGO_RIGHT);
    } else {
        $(`header`).hide();
    };  
};

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){

    displayExperimentHeader();

    loadContent("experiment-container", "html/1-consent.html");
    //loadContent("experiment-container", "html/2-instructions.html");
});