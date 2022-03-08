/* DATA */
class Data {
    constructor() {
        
    }

    getUrl() {
        return new Promise(async function(resolve, reject) {

            const requestURL = './assets/data/url.json';
            const request = new Request(requestURL);
            
            const response = await fetch(request);
            const urlText = await response.text();
            
            const url = JSON.parse(urlText);
        
            resolve(url);
        });
    }
      

    /* Set up XMLHttpRequest */
    ajaxRequest(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(this.response);
            };
            xhr.onerror = reject;
            xhr.open('GET', url);
            
            //xhr.setRequestHeader("Target-Endpoint", "https://github.com/gllmp/gm-ol/blob/main/assets/data/Attributs_Visuel_Web.xlsx");
            //xhr.setRequestHeader("Target-Endpoint", "https://docs.google.com/spreadsheets/d/1lXGYPIITZfSEzN4XdRXRreDcHx5vRik8/export?gid=243091869&format=csv");

            xhr.responseType = "arraybuffer";
            
            xhr.send();
        });
    }

    parseSheetData(_data) {
        /* convert data to binary string */
        let binaryString = this.toBinaryString(_data);

        /* Call XLSX */
        let workbook = XLSX.read(binaryString, {
            type: "binary"
        });
        //console.log("workbook:", workbook);

        // Get sheet name from workbook
        let sheetName = workbook.SheetNames[0];

        // Get worksheet
        let worksheet = workbook.Sheets[sheetName];
        //console.log("worksheet:", worksheet);

        let sheetData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true
        });

        return sheetData;
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
        
            if ((name != "") && (name != "test") && (name != " test") && (name != "NoData") && (name != "No Data") && (name != " No Data")) {
                const keys = Object.keys(element);
                const vals = Object.keys(element).map(key => element[key]);

                for (let i=0; i<keys.length; i++) {
                    //let val = vals[i].split(", ")[1];
                    let val = vals[i].substring(vals[i].indexOf(", ") + 1)

                    if ((val != "") && (val != "test") && (val != " test") && (val != "NoData") && (val != "No Data") && (val != "No Data")) {
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
    
    parseDataByLevels(sheetData) {
        let levelsData = [];
        let levelMax = 1;
        
        sheetData.forEach(element => {
            // Get level max
            let vals = Object.values(element);
            
            for (let i=0; i<vals.length; i++) {
                let lvl = parseInt(vals[i].split(",")[0]);

                levelMax = levelMax < lvl ? lvl : levelMax;
            }

            // Add mission's names as keys
            let name = element.cruise_name.split(", ")[1];

            if ((name != "") && (name != "test") && (name != " test") && (name != "NoData") && (name != "No Data") & (name != " No Data")) {
                levelsData[name] = [];

                // Add levels as mission's keys
                for (let i=0; i<levelMax; i++) {
                    levelsData[name][i+1] = [];
                }

                // Add keys based on level
                const keys = Object.keys(element);
                const vals = Object.values(element);

                for (let i=0; i<keys.length; i++) {
                    let lvl = vals[i].split(", ")[0];
                    let val = vals[i].split(", ")[1];
            
                    if ((val != "") && (val != "test") && (val != " test") && (val != "NoData") && (val != "No Data") && (val != " No Data")) {
                        levelsData[name][lvl].push(keys[i])
                    }
                }
            }

        });

        return levelsData;
    }
}

export default Data;