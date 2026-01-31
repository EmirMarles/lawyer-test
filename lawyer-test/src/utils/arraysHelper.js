export function divideQuestions(array) {
    const chunkSize = Math.ceil(array.length / 4);
    const result = [];
    for (let i = 0; i < 4; i++) {
        const start = i * chunkSize;
        result.push(array.slice(start, start + chunkSize));
    }
    return result;
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