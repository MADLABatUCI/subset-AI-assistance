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
    blockRandomization,
    finalizeBlockRandomization,
    firebaseUserId
} from "./firebasepsych1.0.js";

//  Import functions and variables from experiment Metadata file
import {
    DEBUG,
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
        TRIAL_DATA = presentTrial();
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

//  Sampling Function
async function experimentSetUp2() {
    let numNoiseLevels = 4; // Total number of Noise Levels
    let numBins = 4; // Total number of confidence bins
    let numImages = 32; // Total number of questions per category

    let startIndex = 0;  // Start index for lookup

    let noiseLevelArray = [110, 125, 140, 155];
    // Looping over categories
    for (let noiseLevel = 0; noiseLevel < numNoiseLevels; noiseLevel++) {
        for (let imgNum = 0; imgNum < numImages; imgNum++) {
            // Create a name for this particular combination of noiseLevel and confidence bin
            let lookupTable = `Table_${ORDER_CONDITION_STR}_${MODEL_CONDITION}_${noiseLevelArray[noiseLevel]}_${imgNum.toString().padStart(2, '0')}`;
            // Append lookup table name to LOOKUP_TABLES var (needed for finalization)
            EXPERIMENT_CONDITION_TABLE.push(lookupTable);
            let numDraws = 1; // we sample 1 view option per image per noise level (to create 128 images total)

            // NOTE:
            let assignedQuestion = await blockRandomization(EXPERIMENT_DATABASE_NAME, lookupTable, DISPLAY_OPTIONS,
                MAX_COMPLETION_TIME, numDraws); // the await keyword is mandatory
            // Convert the assignedQuestion to a number
            console.log(assignedQuestion);
            let thisAssignedkSubset = parseInt(assignedQuestion);
            //console.log(optionsToShow);
            //  Options to show are either [2, 4, 8, 16]
            //      optionsToShow will be either [0, 1, 2, 3]
            //      Therefore this gives us
            //    thisAssignedkSubset   |   thisAssignedkSubsetNumber
            //                      0   |   2**(0 + 1) = 2
            //                      1   |   2**(1 + 1) = 4
            //                      2   |   2**(2 + 1) = 8
            //                      3   |   2**(3 + 1) = 16
            let thisAssignedkSubsetNumber = 2**(thisAssignedkSubset + 1);

            // Get the question that will be shown to the participant
            let imageToShow = imgNum;

            OPTIONS_TO_SHOW.push(thisAssignedkSubsetNumber);
            IMAGE_TRIALS.push(startIndex + imageToShow);

            if (DEBUG) {
                console.log(`For Noise Level = ${noiseLevel} we assigned image #${startIndex + imageToShow} and will show ${thisAssignedkSubsetNumber} options with assignment`);
            };
            $('#expCountdown').text(TOTAL_TRIALS - IMAGE_TRIALS.length);
        };
        console.log("\n\n\n");
        startIndex += numImages;
    };
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

/******************************************************************************
    DEBUG

        For now we are in DEBUG mode and will only present a single question.
******************************************************************************/
if (DEBUG) {
    TOTAL_TRIALS = 5;
    IMAGE_TRIALS = [2, 3, 8, 18, 6];
    OPTIONS_TO_SHOW = [2, 4, 16, 8, 4];
    console.log("Trial Questions");
    console.log(trialQuestions);
    EXPERIMENT_TRIALS = trialQuestions;
}
//  Call Sampling function, but make suer we wait until it is finished to continue (await)
else {
    await experimentSetUp2();
    console.log("COMPLETED");
    console.log(IMAGE_TRIALS);
    console.log(OPTIONS_TO_SHOW);
};
hideContent(`#mainexperiment-container-loading-page`);
displayContent(`#trial-container`);

/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    // Display Option Container based on EXP Condition
    displayContent(`.${ORDER_CONDITION_STR}`);
    CURRENT_TRIAL = 1;

    //  Shuffle trials for this experiment!
    shuffle(IMAGE_TRIALS, OPTIONS_TO_SHOW);
    EXPERIMENT_TRIALS = IMAGE_TRIALS.slice(0, TOTAL_TRIALS).map(i => trialQuestions[i]);
    //if (DEBUG_EXPERIMENT_CONCURRENT){
    console.log("Trials\n", IMAGE_TRIALS);
    console.log("Explanation\n", OPTIONS_TO_SHOW);

    //  Present the first image
    TRIAL_DATA = presentTrial();
    console.log("TRIAL DATA IS :", TRIAL_DATA);

    
    $(`.btn-submit`).click(nextTask);
});