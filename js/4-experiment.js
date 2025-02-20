/*
experiment.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Experiment Page METADATA file.
*/

/******************************************************************************
*   IMPORTS
******************************************************************************/
//  Import functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    writeURLParameters,
    blockRandomization,
    finalizeBlockRandomization,
    firebaseUserId
} from "./firebasepsych1.0.js";

//  Import functions and variables from experiment Metadata file
import {
    DEBUG,
    BETWEEN_SUBJECT_ORDER_CONDITIONS,
    BETWEEN_SUBJECT_MODEL_CONDITIONS,
    ORDER_CONDITION,
    ORDER_CONDITION_STR,
    MODEL_CONDITION,
    MODEL_CONDITION_STR,
    EXPERIMENT_CONDITION_TABLE,
    MAX_COMPLETION_TIME,
    EXPERIMENT_DATABASE_NAME,
    METADATA_DB_PATH,
    COMPLETE_FILE,
} from "./metadata.js";

//  Import utility functions
import {
    placeImage,
    hideContent,
    displayContent,
    loadContent,
} from "./utils.js";


// Sample Inputs for Experiment
let sampleData = {
    imageName: 'n01860187_7878',
    noiseType: 'phase',
    noiseLevel: 0,
    trueLabel: 'bird',
    modelArch: 'vgg19',
    modelPerfLvlStr: 'horrible',
    modelPerfLvlInt: -2,
    modelMaxPredStr: 'bird',
    modelMaxPredFloat: 0.9999999269505158,
    correct: 1,
    modelRankOfTrueLabel: 1,
    categories: ['airplane', 'bear', 'bicycle', 'bird', 'boat', 'bottle', 'car', 'cat', 'chair', 'clock', 'dog', 'elephant', 'keyboard', 'knife', 'oven', 'truck'],
    modelAllPredFloat: [7.517744758518959e-13, 7.220553871788471e-09, 5.4689732921935374e-11, 0.9999999269505158, 1.637565831545673e-09, 9.078614813158603e-10, 4.685767810541713e-13, 2.237283887463876e-09, 2.756505419714212e-11, 7.021132478010693e-12, 4.4556572084138055e-08, 1.6346891421948648e-08, 3.14710936339838e-11, 5.626046230954865e-12, 5.7693154138213856e-12, 9.3929839761295e-12],
    modelAllRankInt: [15, 4, 8, 1, 6, 7, 16, 5, 10, 12, 2, 3, 9, 14, 13, 11],
    categoriesOrdered: ['bird', 'dog', 'elephant', 'bear', 'cat', 'boat', 'bottle', 'bicycle', 'keyboard', 'chair', 'truck', 'clock', 'oven', 'knife', 'airplane', 'car'],
    modelAllPredFloatOrdered: [0.9999999269505158, 4.4556572084138055e-08, 1.6346891421948648e-08, 7.220553871788471e-09, 2.237283887463876e-09, 1.637565831545673e-09, 9.078614813158603e-10, 5.4689732921935374e-11, 3.14710936339838e-11, 2.756505419714212e-11, 9.3929839761295e-12, 7.021132478010693e-12, 5.7693154138213856e-12, 5.626046230954865e-12, 7.517744758518959e-13, 4.685767810541713e-13],
    modelAllRankIntOrdered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
};


/******************************************************************************
*   VARIABLES
******************************************************************************/
//      Task Information
let NUMBER_OF_CATEGORIES        = 16;
let CURRENT_TRIAL               = 1;
let TOTAL_TRIALS                = 128;
let DISPLAY_OPTIONS             = 4;
let DATA_FILE = `experiment/data/ksubset_noisy_img_model${MODEL_CONDITION ? "B" : "A"}.json`;
let IMAGE_PATH = `experiment/stimuli`;

//      Database Path
let TRIAL_DB_PATH               = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/trialData';

//      Set Time Variables
let EXPERIMENT_START_TIME       = null;
let TRIAL_START_TIME            = null;
let TRIAL_SELECTION             = null;

//      Trial Information Variables
let EXPERIMENT_TRIALS;
let IMAGE_TRIALS = [];
let OPTIONS_TO_SHOW = [];
let TRIAL_DATA;

//      Element Variables
let optionContainer = $(`#trial-options-container-${ORDER_CONDITION_STR} .options-container`);


/******************************************************************************
    DEBUG

        For now we are in DEBUG mode and will only present a single question.
******************************************************************************/
//  Determine the mode and questions
if (DEBUG){
    TOTAL_TRIALS = 5;
    OPTIONS_TO_SHOW = [2, 4, 16, 8, 4];
} else {
    TOTAL_TRIALS = 5;
    OPTIONS_TO_SHOW = [2, 4, 16, 8, 4];
}


/******************************************************************************
*   FUNCTIONS
******************************************************************************/
function shuffle(obj1, obj2) {
    /*
    Shuffle the given objects in the same way.
    */
    var index = obj1.length;
    var rnd, tmp1, tmp2;

    while (index) {
        rnd = Math.floor(Math.random() * index);
        index -= 1;
        tmp1 = obj1[index];
        tmp2 = obj2[index];
        obj1[index] = obj1[rnd];
        obj2[index] = obj2[rnd];
        obj1[rnd] = tmp1;
        obj2[rnd] = tmp2;
    }
};

function createNewTrialData () {
    let trialIndex = CURRENT_TRIAL - 1;
    let thisTrial = EXPERIMENT_TRIALS[trialIndex];
    let newTrialData = {
        //"trialEndTime": Date().toString(), // REMOVE FROM HERE
        "imageName": thisTrial.imageName,
        "noiseType": thisTrial.noiseType,
        "noiseLevel": thisTrial.noiseLevel,
        "trueLabel": thisTrial.trueLabel,
        "modelArch": thisTrial.modelArch,
        "modelLevelStr": thisTrial.modelPerfLvlStr,
        "modelLevelInt": thisTrial.modelPerfLvlInt,
        "modelMaxPredCat": thisTrial.modelMaxPredStr,
        "modelMaxPred": thisTrial.modelMaxPredFloat,
        "modelCorrect": thisTrial.correct,
        "modelRankOfTrueLabel": thisTrial.modelRankOfTrueLabel,
        "modelAlphaOrderedCategories": thisTrial.categories,
        "modelAlphaOrderedPredValues": thisTrial.modelAllPredFloat,
        "modelAlphaOrderedRankValues": thisTrial.modelAllRankInt,
        "modelRankOrderedCategories": thisTrial.categoriesOrdered,
        "modelRankOrderedPredValues": thisTrial.modelAllPredFloatOrdered,
        "experimentCondition": ORDER_CONDITION_STR,
        "trialNumber": CURRENT_TRIAL,
        "trialOptionsPresented": OPTIONS_TO_SHOW[trialIndex],
        //"questionIndex": IMAGE_TRIALS[trialIndex],
    };
    let categories = thisTrial.categories;
    for (let i = 0; i < NUMBER_OF_CATEGORIES; i++) {
        let thisCategory = categories[i];
        let thisCategoryRank = thisTrial.modelAllRankInt[i];
        newTrialData[`${thisCategory}Presented`] = (thisCategoryRank <= OPTIONS_TO_SHOW[trialIndex]) ? 1 : 0;
        newTrialData[`${thisCategory}PredValue`] = thisTrial.modelAllPredFloat[i];
        newTrialData[`${thisCategory}RankValue`] = thisCategoryRank;
        if (thisCategory == thisTrial.trueLabel) {
            newTrialData["trialOpionsIncludeTrueLabel"] = (thisCategoryRank <= OPTIONS_TO_SHOW[trialIndex]) ? 1 : 0;
        };
    };

    return newTrialData;
};

//  Helper Functions
function displayKRankOptions(k, data) {
    let optionsHTML = ``;
    optionsHTML += `
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
    `;

    for (let i=0; i < 16; i++) {
        if (i < k){
            optionsHTML += `
                <label class="btn btn-option" data-toggle="tooltip" data-placement="top" title="${data[i]}" for="${data[i]}">
                    <text>${data[i]}</text>
                    <br />
                    <img src="images/icons/${data[i]}.png" id="btn-${data[i]}" style="background-color: white; border-radius: 5px"/>
                    <br />
                    ${i+1}
                </label>
        `;
        } else {
            optionsHTML += `
                <label class="btn disabled" data-toggle="tooltip" data-placement="top" title="${data[i]}" for="${data[i]}">
                    <br />
                    <img src="images/icons/${data[i]}.png" style="background-color: black; border-radius: 5px"/>
                    <br />
                </label>
        `;
        }
        
    };
    optionsHTML += `
            </div>
    `;
    optionContainer.html(optionsHTML);
};

function displayKAlphabeticalOptions(k, data, rankings) {
    let optionsHTML = ``;
    optionsHTML += `
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
    `;

    for (let i=0; i < 16; i++) {
        if (rankings[i] <= k){
            optionsHTML += `
                <label class="btn btn-option" data-toggle="tooltip" data-placement="top" title="${data[i]}" for="${data[i]}">
                    <text>${data[i]}</text>
                    <br />
                    <img src="images/icons/${data[i]}.png" id="btn-${data[i]}" style="background-color: white; border-radius: 5px"/>
                </label>
        `;
        } else {
            optionsHTML += `
                <label class="btn disabled" data-toggle="tooltip" data-placement="top" title="${data[i]}" for="${data[i]}">
                    <br />
                    <img src="images/icons/${data[i]}.png" style="background-color: black; border-radius: 5px"/>
                </label>
        `;
        }
        
    };
    optionsHTML += `
            </div>
    `;
    optionContainer.html(optionsHTML);
};

function presentTrial () {
    /*
        Function to display the current trial.

        This handles updating all elements of a trial:
    */
    if (CURRENT_TRIAL === 1){
        EXPERIMENT_START_TIME = new Date();
        writeRealtimeDatabase(
            TRIAL_DB_PATH + "/metadata",
            {
                "experimentStartTime": EXPERIMENT_START_TIME.toString(),
                "experimentCompleted": false,
            }
        );
    };

    //  Task Information
    $('#currentTrial').text(CURRENT_TRIAL);

    //  Update Image
    console.log(EXPERIMENT_TRIALS);
    console.log(CURRENT_TRIAL)
    placeImage('#trial-image img', `${IMAGE_PATH}/${EXPERIMENT_TRIALS[CURRENT_TRIAL-1].imageName}.png`);

    //  Update Options
    if (ORDER_CONDITION) {
        displayKRankOptions(OPTIONS_TO_SHOW[CURRENT_TRIAL-1], EXPERIMENT_TRIALS[CURRENT_TRIAL-1].categoriesOrdered);
    } else {
        displayKAlphabeticalOptions(OPTIONS_TO_SHOW[CURRENT_TRIAL-1], EXPERIMENT_TRIALS[CURRENT_TRIAL-1].categories, EXPERIMENT_TRIALS[CURRENT_TRIAL-1].modelAllRankInt);
    };

    let thisTrialData = createNewTrialData();

    // Initialize all timers
    TRIAL_START_TIME = new Date();
    thisTrialData["trialTimeBegin"] = TRIAL_START_TIME.toString();

    if (DEBUG) {
        console.log(' Current Trial Number   =', CURRENT_TRIAL);
        console.log(' Current Trial Data     =', EXPERIMENT_TRIALS[CURRENT_TRIAL-1]);
        console.log(' Current Trial Options  =', OPTIONS_TO_SHOW[CURRENT_TRIAL-1]);
    };

    $(`.options-container label.btn-option`).click(optionSelected);

    return thisTrialData;
};

function optionSelected () {
    //  Get the category name
    let buttonClicked = $(this).attr("title")
    //  Unselect any previously selected option
    $(`.options-container label.btn-option img`).css("background-color", "white");
    //  Highlight selected option with primary blue color
    $(`.options-container label.btn-option img#btn-${buttonClicked}`).css("background-color", "#007bff");
    //  Activate Yes and No buttons
    $(`#trial-submit-agree .btn`).prop("disabled", false);
    $(`#trial-submit-disagree .btn`).prop("disabled", false);

    //  Save option selected in TRIAL_DATA
    TRIAL_DATA["trialSelection"] = buttonClicked;
    TRIAL_SELECTION = buttonClicked;
};

function submitTrial () {
    //  Get end time for trial
    let trialTimeEnd = new Date();
    //  What to do when a trial is submitted
    let submitType = parseInt($(this).val());
    console.log("Submited :", submitType);

    //  Save submition type in TRIAL_DATA
    TRIAL_DATA["trialSubmitTypeInt"] = submitType;
    TRIAL_DATA["trialSubmitTypeStr"] = (submitType) ? "yes" : "no";
    TRIAL_DATA["trialTimeEnd"] = trialTimeEnd.toString();
    TRIAL_DATA["trialTimeTotal"] = trialTimeEnd - TRIAL_START_TIME;
    
    if (DEBUG) {
        console.log(`Trial ${CURRENT_TRIAL} complete!`);
        console.log(TRIAL_DATA);
    };

    // WRITE TO DATABASE
    writeRealtimeDatabase(
        `${TRIAL_DB_PATH}/trial${CURRENT_TRIAL.toString().padStart(3, '0')}`,
        TRIAL_DATA
    );
};

function nextTask() {
    /*
        Proceed to the next task in the experiment.

        Once the "Submit" button is clicked, you should move onto the
        next task in the experiment. This means that we need to:
    */
    //  Get end time for trial
    let trialTimeEnd = new Date();
    //  What to do when a trial is submitted
    let submitType = parseInt($(this).val());
    console.log("Submited :", submitType);

    //  Save submition type in TRIAL_DATA
    TRIAL_DATA["trialSubmitTypeInt"] = submitType;
    TRIAL_DATA["trialSubmitTypeStr"] = (submitType) ? "yes" : "no";
    TRIAL_DATA["trialTimeEnd"] = trialTimeEnd.toString();
    TRIAL_DATA["trialTimeTotal"] = trialTimeEnd - TRIAL_START_TIME;
    
    if (DEBUG) {
        console.log(`Trial ${CURRENT_TRIAL} complete!`);
        console.log(TRIAL_DATA);
    };

    // WRITE TO DATABASE
    writeRealtimeDatabase(
        `${TRIAL_DB_PATH}/trial${CURRENT_TRIAL.toString().padStart(3, '0')}`,
        TRIAL_DATA
    );

    if (CURRENT_TRIAL >= TOTAL_TRIALS){
        //  Experiment over!
        if (DEBUG) {
            console.log("All trials done");
        }
        EXPERIMENT_CONDITION_TABLE.forEach((table) => finalizeBlockRandomization(EXPERIMENT_DATABASE_NAME, table));
        allTasksDone();
    } else {
        //  Experiment is not over yet

        //  Unselect any previously selected option
        $(`.options-container label.btn-option img`).css("background-color", "white");
        // At the very end, we want to reset some values for the next trial
        //  Reset participant selection to be NULL
        TRIAL_SELECTION = null;
        TRIAL_START_TIME = null;

        //  Deactivate Yes and No buttons
        $(`#trial-submit-agree .btn`).prop("disabled", true);
        $(`#trial-submit-disagree .btn`).prop("disabled", true);

        // Increment the current task number
        CURRENT_TRIAL++;
        // Display the next trial
        presentTrial();
    };
};

function allTasksDone() {
    /*
        All experiment trials are done.

        This will submit the final rankings and then load the
        "Survey" page.
    */
    // Write to Database
    let EXPERIMENT_FINISH_TIME = new Date();
    writeRealtimeDatabase(
        TRIAL_DB_PATH + "/metadata/experimentEndTime",
        EXPERIMENT_FINISH_TIME.toString()
    );
    writeRealtimeDatabase(
        TRIAL_DB_PATH + "/metadata/experimentCompleted",
        true
    );
    writeRealtimeDatabase(
        METADATA_DB_PATH + "/experimentCompleted",
        true
    );
    writeRealtimeDatabase(
        TRIAL_DB_PATH + "/metadata/experimentTotalTime",
        EXPERIMENT_FINISH_TIME - EXPERIMENT_START_TIME
    );

    // Show Completion Page
    loadContent("#experiment-container", COMPLETE_FILE);
};


/******************************************************************************
    ORDERED FUNCTIONALITY

        Run the following sequence of events/functions in order.
******************************************************************************/
//  Load JSON Data into variable
let trialQuestions = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': DATA_FILE,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

//  Only print on DEBUG mode
if (DEBUG) {
    console.log("Trial Questions");
    console.log(trialQuestions);
    EXPERIMENT_TRIALS = trialQuestions;
} else {
    EXPERIMENT_TRIALS = trialQuestions;
};

//  Sampling Function
async function experimentSetUp() {
    let numCategories = 1; // Total number of categories
    let numBins = 4; // Total number of confidence bins
    let numQuestions = 35; // Total number of questions per category

    let startIndex = 0;  // Start index for lookup

    // Looping over categories
    for (let category = 0; category < numCategories; category++) {
    
        // Loop over confidence bins
        for (let cbin = 0; cbin < numBins; cbin++) {


            // Create a name for this particular combination of category and confidence bin
            let lookupTable = 'Table_' + category + '_' + cbin;
            // Append lookup table name to LOOKUP_TABLES var (needed for finalization)
            EXPERIMENT_CONDITION_TABLE.push(lookupTable);
            let numDraws = 10; // we sample TEN question per confidence bin (to create 40 questions total)

            let numQuestionsPerNoiseLevel = 32;    // The FILE we use has 84 questions per confidence bin
            //if (cbin==0) numQuestionsPerNoiseLevel = 5; // we have 5 questions per category in the first confidence bin (0.2-0.4)
            //if (cbin>0) numQuestionsPerNoiseLevel = 10; // we have 10 questions per category in the remaining confidence bins (0.4-0.6; 0.6-0.8; 0.8-1.0)

            // NOTE:
            //  The condition count has now been increased form numQuestionsPerNoiseLevel to numQuestionsPerNoiseLevel * EXPLANATION_OPTIONS
            //  This means that if there are 10 questions in a bin, there are a total of 40 conditions (each questions has 4 possible explanation options)
            //  We will separate the questions and the explanation based on the condition assigned between 0-(numQuestionsPerNoiseLevel*EXPLANATION_OPTIONS - 1)
            let assignedQuestion = await blockRandomization(EXPERIMENT_DATABASE_NAME, lookupTable, numQuestionsPerNoiseLevel*EXPLANATION_OPTIONS,
                MAX_COMPLETION_TIME, numDraws); // the await keyword is mandatory
            // Convert the assignedQuestion to a number
            //console.log(assignedQuestion);
            for (let thisQ = 0; thisQ < assignedQuestion.length; thisQ++) {
                //console.log(thisQ + ") " + assignedQuestion[thisQ]);
                let thisAssignedQuestion = parseInt(assignedQuestion[thisQ]);

                // NOTE:
                //  thisAssignedQuestion will be broken down into two different numbers to determine the question and explanation
                //
                //  Explanation = thisAssignedQuestion % EXPLANATION_OPTIONS
                //
                //  Question    = (thisAssignedQuestion - Explanation) / EXPLANATION_OPTIONS

                // Get the explanation that will be shown to the participant
                let optionsToShow = thisAssignedQuestion % EXPLANATION_OPTIONS;

                // Get the question that will be shown to the participant
                let imageToShow = (thisAssignedQuestion - optionsToShow) / EXPLANATION_OPTIONS;

                // Now, go find which question this is from the list of questions and add to the list for this participant
                // The Topic_number and bin_wide_number are all in order
                // We just need to keep track of how far along we are and keep adding to our start index
                OPTIONS_TO_SHOW.push(optionsToShow);
                IMAGE_TRIAL.push(startIndex + imageToShow);

                //if (DEBUG_EXPERIMENT_CONCURRENT){
                console.log( "For category " + category + " and confidence bin " + cbin + " we assigned question #" + imageToShow + " along with explanation #" + (optionsToShow + 1) + " from that bin and category");
                //};

                $('#expCountdown').text(TOTAL_TRIALS - IMAGE_TRIAL.length);
            };
            startIndex += numQuestionsPerNoiseLevel;
        };

    };
};

//  Call Sampling function, but make suer we wait until it is finished to continue (await)
//await experimentSetUp();

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    // Display Option Container based on EXP Condition
    displayContent(`.${ORDER_CONDITION_STR}`);
    CURRENT_TRIAL = 1;
    //  Present the first image
    TRIAL_DATA = presentTrial();
    console.log("TRIAL DATA IS :", TRIAL_DATA);

    
    $(`.btn-submit`).click(nextTask);
});