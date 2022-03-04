module.exports =class HeuristicAnswer{
    constructor({heuristicId, heuristicQuestions, progress, total, submitted, userDocId} = {}){
        this.heuristicId = heuristicId 
        this.heuristicQuestions = heuristicQuestions 
        this.progress = progress 
        this.total = total 
        this.submitted = submitted 
        this.userDocId = userDocId 
    }
}
