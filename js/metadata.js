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
    blockRandomization,
    firebaseUserId
} from "./firebasepsych1.0.js";

import {
    setText,
    placeImage,
    loadContent,
} from "./utils.js";

/******************************************************************************
*   VARIABLES
******************************************************************************/
// EXPERIMENT METADATA
export var DEBUG = true;
export var BETWEEN_SUBJECT_ORDER_CONDITIONS = 2;
export var BETWEEN_SUBJECT_MODEL_CONDITIONS = 2;
export var ORDER_CONDITION;
export var ORDER_CONDITION_STR;
export var MODEL_CONDITION;
export var MODEL_CONDITION_STR;
export var EXPERIMENT_CONDITION_TABLE = [];
export var MAX_COMPLETION_TIME = 60;
export var EXPERIMENT_NAME = "Subset AI Assistance";
export var EXPERIMENT_DATABASE_NAME = "k-subset-AI-assistance-v01";
if (DEBUG){
        EXPERIMENT_DATABASE_NAME = "DEBUG-" + EXPERIMENT_DATABASE_NAME;
};
export var METADATA_DB_PATH = `${EXPERIMENT_DATABASE_NAME}/participantData/${firebaseUserId}/metadata`;
//  RESEARCHER INFORMATION
export var LEAD_RESEARCHER = "Heliodoro Tejeda";
export var LEAD_RESEARCHER_EMAIL = "htejeda@uci.edu";
export var FACULTY_SPONSOR = "Mark Steyvers";
export var FACULTY_SPONSOR_EMAIL = "mark.steyvers@uci.edu";

// CONTENT FILES
export var CONSENT_FILE = "html/1-consent.html";
export var INSTRUCTIONS_FILE = "html/2-instructions.html";
export var INTEGRITY_FILE = "html/3-integrity-pledge.html";

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
        setText("#experiment-title", EXPERIMENT_NAME);
        placeImage("#university-logo-left", UNIVERSITY_LOGO_LEFT);
        placeImage("#university-logo-right", UNIVERSITY_LOGO_RIGHT);
    } else {
        $(`header`).hide();
    };  
};

//  Sampling Functions
//      Determine the experimental conditions participants will be in
//      Between-Subject:
//          - Subset Ordering (Rank or Alphabetical)
//          - Model Level (-2 or 1)
async function getBetweenSubjectCondition() {
    // How many minutes before a participant will time out (i.e., when we expect them not to finish the study)?
    // We need this (rough) estimate in order to zero out the counts for participants that started the study
    // but did not finish within this time (and will therefore never finish)
    //  MAX_COMPLETION_TIME

    // Assign a random condition for SubsetOrdering
    //  Alphabetical (0) or Rank (1)
    let lookupTable = 'SubsetOrdering'; // a string we use to represent the condition name
    EXPERIMENT_CONDITION_TABLE.push(lookupTable);
    let numDraws = 1; // Number of  assignments (mutually exclusive) we want to sample for this participants
    let assignedCondition = await blockRandomization(EXPERIMENT_DATABASE_NAME, lookupTable, BETWEEN_SUBJECT_ORDER_CONDITIONS,
        MAX_COMPLETION_TIME, numDraws); // the await keyword is mandatory

    ORDER_CONDITION = assignedCondition[0];
    if (ORDER_CONDITION === 1) {
        ORDER_CONDITION_STR = "rank";
    } else {
        ORDER_CONDITION_STR = "alphabetical";
    };

    // Write to Database Metadata
    let path_meta = `${METADATA_DB_PATH}/orderCondition`;
    writeRealtimeDatabase(path_meta, ORDER_CONDITION_STR);
    let path_meta_int = `${METADATA_DB_PATH}/orderConditionInt`;
    writeRealtimeDatabase(path_meta_int, ORDER_CONDITION);

    if (DEBUG) {
        let msg = `Participant was assigned to ${lookupTable} = ${ORDER_CONDITION_STR}`;
        console.log(msg);
    };
};

async function getModelCondition() {
    // How many minutes before a participant will time out (i.e., when we expect them not to finish the study)?
    // We need this (rough) estimate in order to zero out the counts for participants that started the study
    // but did not finish within this time (and will therefore never finish)
    //  MAX_COMPLETION_TIME

    // Assign a random condition for SubsetOrdering
    //  Alphabetical (0) or Rank (1)
    let lookupTable = 'ModelLevel'; // a string we use to represent the condition name
    EXPERIMENT_CONDITION_TABLE.push(lookupTable);
    let numDraws = 1; // Number of  assignments (mutually exclusive) we want to sample for this participants
    let assignedCondition = await blockRandomization(EXPERIMENT_DATABASE_NAME, lookupTable, BETWEEN_SUBJECT_MODEL_CONDITIONS,
        MAX_COMPLETION_TIME, numDraws); // the await keyword is mandatory

    MODEL_CONDITION = assignedCondition[0];
    if (MODEL_CONDITION === 1) {
        MODEL_CONDITION_STR = "good";
    } else {
        MODEL_CONDITION_STR = "poor";
    };

    // Write to Database Metadata
    let path_meta = `${METADATA_DB_PATH}/modelCondition`;
    writeRealtimeDatabase(path_meta, MODEL_CONDITION_STR);
    let path_meta_int = `${METADATA_DB_PATH}/modelConditionInt`;
    writeRealtimeDatabase(path_meta_int, MODEL_CONDITION);

    if (DEBUG) {
        let msg = `Participant was assigned to ${lookupTable} = ${MODEL_CONDITION_STR}`;
        console.log(msg);
    };
};

await getBetweenSubjectCondition();
await getModelCondition();

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){

    displayExperimentHeader();

    //loadContent("#experiment-container", "html/1-consent.html");
    loadContent("#experiment-container", "html/2-instructions.html");
});