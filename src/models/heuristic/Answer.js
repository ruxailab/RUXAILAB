module.exports = class Answer{
    constructor({type, heuristicAnswers, taskAnswers} = {}){
        this.type = type 
        this.heuristicAnswers = heuristicAnswers
        this.taskAnswers = taskAnswers
    }
}
