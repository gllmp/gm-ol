/* DATA */
class Data {
    constructor() {
        
    }

    /* set up XMLHttpRequest */
    ajaxRequest(url) {
        return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            resolve(this.response);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.responseType = "arraybuffer";
        
        xhr.send();
        });
    }

    toBinaryString(data) {
        let arraybuffer = data;

        let bufferData = new Uint8Array(arraybuffer);
        let arr = new Array();

        for (let i = 0; i != bufferData.length; ++i) arr[i] = String.fromCharCode(bufferData[i]);
        
        let bstr = arr.join("");
        
        return bstr;
    }
    
    
    getDataFromSheet(sheetData) {
        let processedData = [];
    
        sheetData.forEach(element => {
        let obj = {};
    
        let name = element.cruise_name.split(", ")[1];
    
        if ((name != "") && (name != "test") && (name != "NoData")) {
            const keys = Object.keys(element);
            const vals = Object.keys(element).map(key => element[key]);
            
            for (let i=0; i<keys.length; i++) {
            let val = vals[i].split(", ")[1];
    
            if ((val != "") && (val != "test") && (val != "NoData")) {
                let tempKeyVal = {};
                tempKeyVal[keys[i]] = val;
    
                Object.assign(obj, tempKeyVal);
            }  
            }
    
            processedData.push(obj);
        }
        });
    
        return processedData;
    }
}

export default Data;

