/**
* Create a Notification.
* @param {string} title - The title value.
* @param {string} description - The description value.
*/

export default class Notification {
    constructor({
        title,
        description,
        redirectsTo,
        read
    } = {}
    ) {
        this.title = title;
        this.description = description;
        this.redirectsTo = redirectsTo;
        this.createdDate = Date.now()
        this.read = read
    }
    static toNotification(data) {
        return new Notification(data)
    }

    toFirestore() {
        return {
            title: this.title,
            description: this.description,
            redirectsTo: this.redirectsTo,
            createdDate: this.createdDate,
            read: this.read
        }
    }
}