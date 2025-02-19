/*
consent.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Consent Page METADATA file.

This file should contain static experimental metadata such as:
    - Experiment Summary
    - Experiment Estimated Time
    - Compensation
    -
    -
*/

/******************************************************************************
*   IMPORTS
******************************************************************************/
//  Import functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    writeURLParameters,
    firebaseUserId
} from "./firebasepsych1.0.js";

//  Import functions and variables from experiment Metadata file
import {
    DEBUG,
    EXPERIMENT_DATABASE_NAME,
    METADATA_DB_PATH,
    //EXPERIMENT_NAME,
    UNIVERSITY_SEAL,
    LEAD_RESEARCHER,
    LEAD_RESEARCHER_EMAIL,
    FACULTY_SPONSOR,
    FACULTY_SPONSOR_EMAIL,
    INSTRUCTIONS_FILE,
} from "./metadata.js";

//  Import utility functions
import {
    placeImage,
    setResearcherInfo,
    loadContent,
} from "./utils.js";


/******************************************************************************
*   VARIABLES
******************************************************************************/
//  Consent Data
let CONSENT_DATA = {
    'consented': null,
    'consentTime': null,
};


/******************************************************************************
*   FUNCTIONS
******************************************************************************/
function activateButton() {
    /*
        Activate the submit button.

        Activates and deactivates the submit button based on a user checking
        or unchecking the consent box.
    */
    if (DEBUG){
        console.log("INSIDE ACTIVATE BUTTON");
        console.log(CONSENT_DATA);
    };

    if (this.checked) {
        document.getElementById("submit-consent").disabled = false;
        CONSENT_DATA['consented'] = true;
        CONSENT_DATA['consentTime'] = Date().toString();
    }
    else {
        document.getElementById("submit-consent").disabled = true;
        CONSENT_DATA['consented'] = false;
        CONSENT_DATA['consentTime'] = null;
    };
};

function writeURLParams () {
    /*  WRITE TO FIREBASE */
    // Save URL parameters on the path: "[studyId]/participantData/[firebaseUserId]/participantInfo"
    let pathnow = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/participantInfo';
    writeURLParameters( pathnow );
};

function submitConsent() {
    /*
        Consent has been submitted and we can move onto the next page.

        Hide all consent page content and activate (show) instruction
        page content.
    */
    // Hide Consent & Show Instructions
    loadContent("#experiment-container", INSTRUCTIONS_FILE);

    // Write to Database
    let path = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/consentData';
    writeRealtimeDatabase(path, CONSENT_DATA);

    // Write to Database Metadata
    let path_meta = `${METADATA_DB_PATH}/experimentCompleted`;
    writeRealtimeDatabase(path_meta, false);
    let path_meta_inst = `${METADATA_DB_PATH}/instructionsCompleted`;
    writeRealtimeDatabase(path_meta_inst, false);
};

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){

    //  Place University seal in consent page
    placeImage("#university-seal", UNIVERSITY_SEAL);

    //  Set researcher information
    //      Lead Researcher
    setResearcherInfo(
        "#lead-researcher",
        LEAD_RESEARCHER,
        LEAD_RESEARCHER_EMAIL,
        "Subset AI Assistance Experiment",
        FACULTY_SPONSOR_EMAIL
    );
    //      Faculty Sponsor
    setResearcherInfo(
        "#faculty-sponsor",
        FACULTY_SPONSOR,
        FACULTY_SPONSOR_EMAIL,
        "Subset AI Assistance Experiment",
        LEAD_RESEARCHER_EMAIL
    );

    //  Write the URL Parameters
    writeURLParams();

    //  Set listeners for button clicks
    $('#terms').click(activateButton);
    $('#submit-consent').click(submitConsent);
});