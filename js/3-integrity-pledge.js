/*
comprehension-quiz.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Comprehension Quiz Page METADATA file.

This file should contain static variables and functions for
to conduct the comprehension quiz.

There will be no quiz, rather an integrity pledge to sign.
*/

/******************************************************************************
    IMPORTS

        Import all FirebaseJS functionality.
******************************************************************************/
/// Importing functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    firebaseUserId
} from "./firebasepsych1.0.js";

//  Import functions and variables from experiment Metadata file
import {
    DEBUG,
    EXPERIMENT_DATABASE_NAME,
    METADATA_DB_PATH,
    EXPERIMENT_FILE,
} from "./metadata.js";

//  Import utility functions
import {
    loadContent,
} from "./utils.js";

/******************************************************************************
    METADATA

        All metadata variables that are relevant to the quiz page.
******************************************************************************/

//      Quiz Information
var INTEGRITY_PLEDGE    = false;

// Database Path
var INTEGRITY_DB_PATH   = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/integrityPledge';


/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the comprehension-quiz.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    /*
        INTEGRITY DATA
    */
    let INTEGRITY_DATA = {
        'pledged': null,
        'pledgeTime': null,
    };
    /******************************************************************************
        FUNCTIONALITY

            All functions that will be used for the quiz page.
    ******************************************************************************/
    function pledgeIntegrity() {
        /*
            Functionality once a participant has clicked on the integrity button.

            Once the checkbox is clicked, we must enable the Submit button.
        */
        if (INTEGRITY_PLEDGE) {
            $('#integrity-pledge-submit').attr('disabled', true);
            INTEGRITY_PLEDGE = false;
            INTEGRITY_DATA['pledged'] = false;
            INTEGRITY_DATA['pledgeTime'] = null;
        } else {
            $('#integrity-pledge-submit').attr('disabled', false);
            INTEGRITY_PLEDGE = true;
            INTEGRITY_DATA['pledged'] = true;
            INTEGRITY_DATA['pledgeTime'] = Date().toString();
        }
        
    };

    function moveOntoMainExperiment() {
        // Write to Database
        writeRealtimeDatabase(INTEGRITY_DB_PATH, INTEGRITY_DATA);

        // TODO
        //  Update metadata in DB as well
    
        // Hide Instructions & Show Pledge (or Quiz)
        loadContent("#experiment-container", EXPERIMENT_FILE);
    };

    // Integrity Pledge Checkbox
    $('#integrity-pledge-button').change(pledgeIntegrity);
    // Integrity Submit
    $('#integrity-pledge-submit').click(moveOntoMainExperiment);
});