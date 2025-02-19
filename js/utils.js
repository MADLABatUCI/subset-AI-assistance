

/******************************************************************************
*   FUNCTIONS
******************************************************************************/
export function setText (identifier, title) {
    $(`${identifier}`).text(title);
};

export function placeImage (identifier, imagePath) {
    $(`${identifier}`).prop('src', imagePath);
};

export function setResearcherInfo (identifier, name, email, subject, cc) {
    $(`${identifier} text`).text(name);
    $(`${identifier} a`).text(email);

    let setCC = (typeof cc === 'undefined') ? '' : `cc=${cc}&`;
    let mailto = `mailto:${email}?${setCC}Subject=${subject.replaceAll(' ', '%20')}`;
    $(`${identifier} a`).attr('href', mailto);
};

export function hideContent (identifier) {
    $(`${identifier}`).attr("hidden", true);
};

export function displayContent (identifier) {
    $(`${identifier}`).attr("hidden", false);
};

export function clearContent (identifier) {
    $(`${identifier}`).html('');
};

export function loadContent (identifier, newContent) {
    clearContent(identifier);
    $(`${identifier}`).load(newContent);
};