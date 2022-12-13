     /**
     * Create a TestStructureOptions.
     * @param {string} text - The text value.
     * @param {number} value - The value value.
     */

export default class TestStructureOptions{
    constructor(text, value){
        this.text = text;
        this.value = value;
    }
    static toTestStructureOptions(){
        return new TestStructureOptions()
    }
}