/*
complete.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Complete Page JS file (metadata and functionality).

This file should contain all variables and functions needed for
the end of the experiment.
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
    PROLIFIC_REDIRECT,
} from "./metadata.js";


/******************************************************************************
    VARIABLES

        All metadata variables that are relevant to the survey page.
******************************************************************************/
// Database Path
let COMPLETE_DB_PATH        = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/userFeedback';


/******************************************************************************
    FUNCTIONALITY

        All functions that will be used for the complete page.
******************************************************************************/
function redirectToProlific() {
    /*
        Redirect participants back to prolific after the study.
    */
    //  Redirect URL
    window.location.replace(PROLIFIC_REDIRECT.slice(-1));
}

function submitFeedback() {
    /*
        Submit user feedback.
    */
    writeRealtimeDatabase(
        COMPLETE_DB_PATH,
        {
            "feedbackTime": Date().toString(),
            "feedbackText": $('#user-feedback-text').val()
        }
    );
};

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    //  Copy Unique Code to Clipboard
    $('#unique-code-copy-button').click(redirectToProlific);

    //  Submit User Feedback
    $('#user-feedback-button').click(submitFeedback);
});