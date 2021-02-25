function elementCleaner(element,$){
    const cleanedUpArray = $(element).text().replace(/\t/g,'').trim() //replaces all occurrences of "\t" with "" 
    .split("\n")  // transform into array by spliting the string on "\n"
    .filter(item => /\S/.test(item)) // removes all the occurences of "" character

    return cleanedUpArray
}

module.exports = elementCleaner;