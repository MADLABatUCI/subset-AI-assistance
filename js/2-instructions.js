/*
instructions.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Instruction Page METADATA file.
*/

/******************************************************************************
*   IMPORTS
******************************************************************************/
//  Import functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    writeURLParameters,
    blockRandomization,
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
    INTEGRITY_FILE,
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
//  Database Path
var INSTRUCTIONS_DB_PATH = `${EXPERIMENT_DATABASE_NAME}/participantData/${firebaseUserId}/instructionData`;
//  Instruction Metadata
let TOTAL_INSTRUCTION_PAGES = 6;
let CURRENT_INSTRUCTION_PAGE = 1;
//  
let INSTRUCTION_START_TIME;
let previousButtonActive = false;
let nextButtonActive = true;

let EXPERIMENT_EXAMPLE_COPIES = [];
for (let i = 0; i < TOTAL_INSTRUCTION_PAGES; i++) {
    EXPERIMENT_EXAMPLE_COPIES.push(
        $(`.example-experiment-container`).clone()
    );
};
console.log(EXPERIMENT_EXAMPLE_COPIES[0]);


/******************************************************************************
*   FUNCTIONS
******************************************************************************/
//  Helper Functions
function disableButton (id) {
    $(`#${id}`).addClass("disabled");
    $(`#${id} a`).attr("tabindex", "-1");
};

function enableButton (id) {
    $(`#${id}`).removeClass("disabled");
    $(`#${id} a`).removeAttr("tabindex");
};

function setActive (id) {
    $(`#${id}`).addClass("active");
};

function removeActive (id) {
    $(`#${id}`).removeClass("active");
};

function hideInstructionPage (pageNumber) {
    hideContent(`.page-${pageNumber}`);
};

function modifyOpacity (identifier, value) {
    $(`${identifier}`).css("opacity", value);
};

function blackOutOption (option) {
    $(`.example-experiment-option-container label[title=${option}] text`).css("visibility", "collapse");
    $(`.example-experiment-option-container label[title=${option}] img`).css("background-color", "black");
};

function blackOutExamples () {
    blackOutOption("elephant");
    blackOutOption("keyboard");
    blackOutOption("knife");
    blackOutOption("oven");
    blackOutOption("truck");
};

function blackOutTrialRun () {
    blackOutOption("airplane");
    blackOutOption("bicycle");
    blackOutOption("boat");
    blackOutOption("clock");
    blackOutOption("keyboard");
    blackOutOption("knife");
    blackOutOption("oven");
    blackOutOption("truck");
}

function highlight (identifier, color) {
    $(`${identifier}`).css("background-color", color);
}

function highlightOption (option, color, loc = ".example-experiment-option-container") {
    highlight(`${loc} label[title=${option}] img`, color);
};

async function loadInstructionHTML () {
    console.log("Loading instruction pages");
    for (let i = 1; i <= TOTAL_INSTRUCTION_PAGES; i++) {
        $(`.example-experiment`).html(EXPERIMENT_EXAMPLE_COPIES[i-1]);
        if (i == 1) {
            blackOutExamples();
        } else if (i == 2) {
            blackOutExamples();
            highlight("#example-trial-count", "yellow");
            highlight("#sample-image img", "cyan");
            modifyOpacity(".example-option-container", 0.25);
            modifyOpacity(".example-submit-container", 0.25);
        } else if (i == 3) {
            blackOutExamples();
            modifyOpacity("#example-trial-count", 0.25);
            modifyOpacity("#sample-image", 0.25);
            modifyOpacity(".example-submit-container", 0.25);
        } else if (i == 4) {
            highlightOption("dog", "white");
            //  Clear content first so that duplication doesn't occur
            $("#example-options-container").html("");
            let categoryOptions = $(".example-experiment-option-container").clone();
            hideContent(".example-experiment-container");
            $("#example-options-container").html(categoryOptions);
            $("#example-options-container #example-experiment-option-container label").css(
                "width", "12%"
            );
        } else if (i == 5) {
            hideContent(".example-experiment-container");
            displayContent(`.${ORDER_CONDITION_STR}`);
        } else if (i == 6) {
            placeImage("#sample-image img", "images/instructions/n02504458_4583.png");
            let AIsuggestions = $(`#example-options-${ORDER_CONDITION_STR}`).clone();
            $("#example-option-button-container").html(AIsuggestions);
            if (ORDER_CONDITION) {
                $("#example-option-button-container").append(`
                    <div class="col-12" style="display: flex; justify-content: space-between;">
                        <h6 style="text-align: left" id="most-likely">Most Likely</h6>
                        <hr style="width: 75%; border-top: 2px solid black;"/>
                        <h6 style="text-align: right" id="least-likely">Least Likely</h6>
                    </div>
                `);
            };
        };
    };
    generatePagination();
    displayInstructionPage(CURRENT_INSTRUCTION_PAGE, true);
};

//  Display Functions (and display functionality)
function determineActionForInstructionPage () {
    $(`.instruction-page`).scrollTop(0);
    //  Load example experiment from copies
    //      This allows us to make modifications for each instruction page more easily
    $(`.example-experiment`).html(EXPERIMENT_EXAMPLE_COPIES[CURRENT_INSTRUCTION_PAGE-1]);
    if (CURRENT_INSTRUCTION_PAGE == 1) {
        nextButtonActive = true;
        enableButton("next-button");
    } else if (CURRENT_INSTRUCTION_PAGE == 2) {
        nextButtonActive = true;
        enableButton("next-button");
    } else if (CURRENT_INSTRUCTION_PAGE == 3) {
        nextButtonActive = false;
        disableButton("next-button");
        highlightOption("dog", "yellow");
        $(`.example-experiment-option-container label[title='dog']`).click(
            function () {
                nextButtonActive = true;
                enableButton("next-button");
                highlightOption("dog", "#007bff");
        });
    } else if (CURRENT_INSTRUCTION_PAGE == 4) {
        nextButtonActive = true;
        enableButton("next-button");
        highlightOption("dog", "white");
        $(`.example-experiment-option-container label[title='dog']`).unbind('click');
    } else if (CURRENT_INSTRUCTION_PAGE == 5) {
        nextButtonActive = true;
        enableButton("next-button");
        highlightOption("dog", "white", ".option-container-3");
        highlightOption("bird", "white", ".option-container-3");
        highlightOption("elephant", "white", ".option-container-3");
        highlightOption("bear", "white", ".option-container-3");
        $(`.option-container-3 label[title='dog']`).unbind('click');
        $(`.option-container-3 label[title='bird']`).unbind('click');
        $(`.option-container-3 label[title='elephant']`).unbind('click');
        $(`.option-container-3 label[title='bear']`).unbind('click');
    } else if (CURRENT_INSTRUCTION_PAGE == 6) {
        nextButtonActive = false;
        disableButton("next-button");
        $("#example-submit-agree button").prop("disabled", true);
        $("#example-submit-disagree button").prop("disabled", true);
        highlightOption("dog", "white", ".option-container-3");
        highlightOption("bird", "white", ".option-container-3");
        highlightOption("elephant", "white", ".option-container-3");
        highlightOption("bear", "white", ".option-container-3");
        $(`.option-container-3 label[title='bird']`).click(
            function () {
                highlightOption("bird", "#007bff", ".option-container-3");
                highlightOption("dog", "white", ".option-container-3");
                highlightOption("elephant", "white", ".option-container-3");
                highlightOption("bear", "white", ".option-container-3");
                $("#example-submit-agree button").prop("disabled", false);
                $("#example-submit-disagree button").prop("disabled", false);
        });
        $(`.option-container-3 label[title='dog']`).click(
            function () {
                highlightOption("bird", "white", ".option-container-3");
                highlightOption("dog", "#007bff", ".option-container-3");
                highlightOption("elephant", "white", ".option-container-3");
                highlightOption("bear", "white", ".option-container-3");
                $("#example-submit-agree button").prop("disabled", false);
                $("#example-submit-disagree button").prop("disabled", false);
        });
        $(`.option-container-3 label[title='elephant']`).click(
            function () {
                highlightOption("bird", "white", ".option-container-3");
                highlightOption("dog", "white", ".option-container-3");
                highlightOption("elephant", "#007bff", ".option-container-3");
                highlightOption("bear", "white", ".option-container-3");
                $("#example-submit-agree button").prop("disabled", false);
                $("#example-submit-disagree button").prop("disabled", false);
        });
        $(`.option-container-3 label[title='bear']`).click(
            function () {
                highlightOption("bird", "white", ".option-container-3");
                highlightOption("dog", "white", ".option-container-3");
                highlightOption("elephant", "white", ".option-container-3");
                highlightOption("bear", "#007bff", ".option-container-3");
                $("#example-submit-agree button").prop("disabled", false);
                $("#example-submit-disagree button").prop("disabled", false);
        });
        $(`#example-submit-agree button`).click(
            function () {
                finishInstructions();
        });
        $(`#example-submit-disagree button`).click(
            function () {
                finishInstructions();
        });
    };
};

function displayInstructionPage (pageNumber, writeDB = false) {

    //  Run JS specific functionality for the specific instruction page
    determineActionForInstructionPage();

    displayContent(`.page-${pageNumber}`);
    setActive(`instruction-button-${pageNumber}`);

    if (CURRENT_INSTRUCTION_PAGE > 1) {
        enableButton("previous-button");
    }
    //  If the current instruction page is <= 1, disable "Previous" button.
    else {
        disableButton("previous-button");
    };

    //  Write instruction metadata to firebase
    if (writeDB) {
        INSTRUCTION_START_TIME = new Date();
        writeRealtimeDatabase(
            INSTRUCTIONS_DB_PATH,
            {
                "StartTime": INSTRUCTION_START_TIME.toString(),
                "Completed": false,
                "PageNumber": pageNumber,
                "TotalPages": TOTAL_INSTRUCTION_PAGES,
                "DebugMode": DEBUG,
                "Skipped": false,
            }
        );
    };
};

//  Navigation Functions
function generatePagination () {
    /*
    Create pagination buttons.

    This will automatically create all of the numbers "button"s for
    all of the indivisual instruction pages. These buttons are
    disabled, but they will allow the participant to visualize
    where they are in the instructions.

    These numbers will change color to reflect the current instruction
    page the participant is on. The current page will be darker than
    all other options.
    */
    let previousElement = "previous-button";
    for (let i = 1; i <= TOTAL_INSTRUCTION_PAGES; i++) {
        let elementDisabled = "";
        let elementTabIndex = "";
        if (i > CURRENT_INSTRUCTION_PAGE) {
            elementDisabled = 'disabled';
            elementTabIndex = 'tabindex="-1"';
        }
        let paginationButtonSelector = `instruction-button-${i}`;
        let paginationButton = `
            <li class="page-item ${elementDisabled}" id="${paginationButtonSelector}" value=${i}>
                <a class="page-link" href="#" ${elementTabIndex}>
                    ${i}
                </a>
            </li>
        `;
        $(paginationButton).insertAfter(`#${previousElement}`);
        $(`#${paginationButtonSelector}`).click(paginateButton);
        previousElement = paginationButtonSelector;
    };
};

function paginateButton () {
    //  Change the instruction page that is being shown to participant
    if (! $(this).hasClass("disabled")) {
        hideInstructionPage(CURRENT_INSTRUCTION_PAGE);
        CURRENT_INSTRUCTION_PAGE = $(this).val();
        displayInstructionPage(CURRENT_INSTRUCTION_PAGE);
    
        //  Iterate over buttons to disable
        for (let i = CURRENT_INSTRUCTION_PAGE + 1; i <= TOTAL_INSTRUCTION_PAGES; i++) {
            console.log("COUNT UP:", i);
            disableButton(`instruction-button-${i}`);
        };

        writeRealtimeDatabase(
            `${INSTRUCTIONS_DB_PATH}/PageNumber`,
            CURRENT_INSTRUCTION_PAGE
        );
    };
};

function previousButton () {
    /*
    Instructions previous button functionality.

    This function will control what is exectued when the "Previous"
    button is selected. Once selected, the previous instruction page
    will be rendered for the participant to see. This will be
    reflected in the variable CURRENT_INSTRUCTION_PAGE.

    NOTE:
        The "Previous" button is disabled whenever a participant is
        on the 1st page of instructions (there is no previous page
        to go to).
    */
    if (CURRENT_INSTRUCTION_PAGE > 1) {
        //  Decrement current instruction page
        CURRENT_INSTRUCTION_PAGE--;

        //  Make a note of what the previous instruction page was
        let previous_instruction_number = CURRENT_INSTRUCTION_PAGE + 1;

        //  Change the instruction page that is being shown to participant
        hideInstructionPage(previous_instruction_number);
        displayInstructionPage(CURRENT_INSTRUCTION_PAGE);


        //      Iterate over buttons to disable
        for (let i = previous_instruction_number; i > CURRENT_INSTRUCTION_PAGE; i--) {
            console.log("COUNT DOWN:", i);
            disableButton(`instruction-button-${i}`);
        }
    };

    writeRealtimeDatabase(
        `${INSTRUCTIONS_DB_PATH}/PageNumber`,
        CURRENT_INSTRUCTION_PAGE
    );

    // For DEBUG purposes
    if (DEBUG) {
        console.log('Previous Button Clicked');
        console.log('Instruction Number' + CURRENT_INSTRUCTION_PAGE );
    };
    
};

function nextButton () {
    /*
    Instructions next button functionality.

    This function will control what is exectued when the "Next"
    button is selected. Once selected, the next instruction page
    will be rendered for the participant to see. This will be
    reflected in the variable CURRENT_INSTRUCTION_PAGE.

    NOTE:
        The "Next" button is converted to a "Proceed" button
        whenever the participant has reached the last instruction
        page.
    */
    if (nextButtonActive) {
        if (CURRENT_INSTRUCTION_PAGE < TOTAL_INSTRUCTION_PAGES) {
            // Increment current instruction page
            CURRENT_INSTRUCTION_PAGE++;
    
            // Make a note of what the previous instruction page was
            let previous_instruction_number = CURRENT_INSTRUCTION_PAGE - 1;
    
            //  Change the instruction page that is being shown to participant
            hideInstructionPage(previous_instruction_number);
            displayInstructionPage(CURRENT_INSTRUCTION_PAGE);

            removeActive(`instruction-button-${previous_instruction_number}`);
    
            //  Enable current instruction button
            enableButton(`instruction-button-${CURRENT_INSTRUCTION_PAGE}`);
            // Enable the "Previous" button whenever we are past the 1st
            //  instruction page.
            if (CURRENT_INSTRUCTION_PAGE > 1){
                enableButton("previous-button");
            };
            
            //  TODO
            //determineActionForInstructionPage();
        }
        // If we increment greater than the total instruction page count
        //  then we know we have clicked the proceed button and are
        //  done with the instructions completely. We can now move onto
        //  the comprehension quiz section.
        else if (CURRENT_INSTRUCTION_PAGE > TOTAL_INSTRUCTION_PAGES) {
            finishInstructions();
        }
        //  Otherwise
        //      CURRENT_INSTRUCTION_PAGE == TOTAL_INSTRUCTION_PAGES
        else {
            console.log("on last page of instructions");
        }
    
        // For DEBUG purposes
        if (DEBUG) {
            console.log('Next Button Clicked');
            console.log('Instruction Number' + CURRENT_INSTRUCTION_PAGE );
        };

        writeRealtimeDatabase(
            `${INSTRUCTIONS_DB_PATH}/PageNumber`,
            CURRENT_INSTRUCTION_PAGE
        );
    } else {
        // For DEBUG purposes
        if (DEBUG) {
            console.log('Next Button Clicked');
            console.log('Instruction Number' + CURRENT_INSTRUCTION_PAGE );
            console.log("NOTHING TO DO");
        };
    };
    
};

//  Instructions Complete Functionality
function finishInstructions () {
    /*
    This function is for DEBUG mode only!

    This gives you, the programmer, the option to skip instructions
    while you are debugging your experiment. It will just simply
    hide the instructions sections of the experiment and move onto
    the comprehension quiz.

    Params
    ------
    skip    :   boolean
        - Skip Instructions or not
    */
    let INSTRUCTION_END_TIME = new Date();
    // Write to Database
    writeRealtimeDatabase(
        `${INSTRUCTIONS_DB_PATH}/Completed`,
        true
    );
    writeRealtimeDatabase(
        `${INSTRUCTIONS_DB_PATH}/EndTime`,
        INSTRUCTION_END_TIME.toString()
    );
    writeRealtimeDatabase(
        `${INSTRUCTIONS_DB_PATH}/TotalTime`,
        INSTRUCTION_END_TIME - INSTRUCTION_START_TIME
    );

    // TODO
    //  Update metadata in DB as well

    // Hide Instructions & Show Pledge (or Quiz)
    loadContent("#experiment-container", INTEGRITY_FILE);
};


await loadInstructionHTML();
/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    //  Load instruction page
    //      NOTE: if you are debugging, load the page you want to work on
    if (DEBUG) {
        CURRENT_INSTRUCTION_PAGE = 4;
    };

    //  Activate event listeners for button clicks
    $("#previous-button").click(previousButton);
    $("#next-button").click(nextButton);
});