export function hasAnswers(arr){
    let hasAnswers = false 

    for (let i = 0; i < arr.length; i++){
        if (arr[i] !== null){
            hasAnswers = true
        }
    }

    return hasAnswers
}

export function hasAllAnswers(arr){

    let check  = {
        hasAllAnswers : true,
        index : null
    }

    for (let i = 0; i < arr.length; i++){
        if (arr[i] === null){
            check.hasAllAnswers = false
            check.index = i
        }
    }

    return check
}