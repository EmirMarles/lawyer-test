export function divideQuestions(array) {
    let arrayOfArrays = new Array(4).fill([])
    let mainLength = array.length / 4
    let mainArrayIndex = 0

    let i = 0
    while (i < arrayOfArrays.length) {
        // this fucking line
        arrayOfArrays[i] = []
        let j = 0
        while (mainArrayIndex < mainLength) {
            arrayOfArrays[i][j] = array[mainArrayIndex]
            mainArrayIndex++;
            j++;
        }
        mainLength += 23
        i++;
    }

    return (arrayOfArrays)
}

// const result = divideQuestions(questions)
// console.log('Question Ids:')

// for (let i = 0; i < result.length; i++) {
//     for (let j = 0; j < result[i].length; j++) {
//         process.stdout.write(`${result[i][j].questionId}, `)
//     }
//     console.log('')
// }

// with these custom libraries 

// chunking the stuff that is needed for the moment 
// related to the main idea of individuation


// result.forEach((subarray) => subarray.forEach((array) => process.stdout.write(`${array.questionId},`)))