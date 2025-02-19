

/******************************************************************************
*   FUNCTIONS
******************************************************************************/
export function setText (id, title) {
    $(`#${id}`).text(title);
};

export function placeImage (id, imagePath) {
    $(`#${id}`).prop('src', imagePath);
};

export function setResearcherInfo (id, name, email, subject, cc) {
    $(`#${id} text`).text(name);
    $(`#${id} a`).text(email);

    let setCC = (typeof cc === 'undefined') ? '' : `cc=${cc}&`;
    let mailto = `mailto:${email}?${setCC}Subject=${subject.replaceAll(' ', '%20')}`;
    $(`#${id} a`).attr('href', mailto);
};

export function hideContent (id) {
    $(`#${id}`).attr("hidden", true);
};

export function displayContent (id) {
    $(`#${id}`).attr("hidden", false);
};

export function clearContent (id) {
    $(`#${id}`).html('');
};

export function loadContent (id, newContent) {
    clearContent(id);
    $(`#${id}`).load(newContent);
};