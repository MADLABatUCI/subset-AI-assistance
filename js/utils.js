

/******************************************************************************
*   FUNCTIONS
******************************************************************************/
export function setText (title) {
    $('#experiment-title').text(title);
};

export function placeImage (id, imagePath) {
    $(`#${id}`).prop('src', imagePath);
};

export function clearContent (id) {
    $(`#${id}`).html('');
};

export function loadContent (id, newContent) {
    clearContent(id);
    $(`#${id}`).load(newContent);
};