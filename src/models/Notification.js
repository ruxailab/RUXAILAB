     /**
     * Create a Notification.
     * @param {string} title - The title value.
     * @param {string} description - The description value.
     */

export default class Notification {
    constructor(title, description){
        this.title = title;
        this.description = description;
    }
    static toNotification(){
        return new Notification()
    }
}