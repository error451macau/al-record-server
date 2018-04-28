/**
 * Generate a <style> tag which sets the abstain sector text color to white and append it to the pieElem
 * @param {HTMLElement} pieElem The DOM element which the pie will be plotted in, MUST HAVE AN ID
 * @param {Object} dataObject A plotly data object
 */
module.exports = function(pieElem, dataObject){
    // denotes which sector is the abstain sector, under "normal" case is 2 (3rd)
    // E.G. when No has 0/null vote, abstainSectorIndex will become 1
    // E.G. when Abstain has 0/null vote, abstainSectorIndex should be null
    var abstainSectorIndex = null;

    if(dataObject.values[2] != null){ // if has abstain
        if(dataObject.values[0] != null && dataObject.values[1] != null){ // if has yes AND has no
            abstainSectorIndex = 2; // is the original 3rd sector
        } else if (dataObject.values[0] != null || dataObject.values[1] != null) { // if has yes OR has no (not both)
            abstainSectorIndex = 1;
        } else { // no yes AND no no
            abstainSectorIndex = 0;
        }
    }
    
    if(abstainSectorIndex !== null) {
        // be aware CSS :nth-child is 1-base
        pieElem.innerHTML += "<style>#" + pieElem.id + " .pielayer .slice:nth-child(" + (abstainSectorIndex + 1) + ") .slicetext text {fill: #ebebeb !important}</style>";
    }
}
