const { Workbook } = require('exceljs');

var jsUtility = function () {
    // generate timestamp which include date and time
    this.getTimeStamp = function () {
        const d = new Date();
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const hour = d.getHours();
        const min = d.getMinutes();
        const secs = d.getSeconds();
        const space = '_';

        const timeStamp = day + space + month + space + year + space + hour + space + min + space + secs;
        return timeStamp;
    }

    // reads configuration from "ReportConfig"
    this.readCell = async function (columnName) {
        var matchFlag = false;
        var filePath = process.cwd() + "\\e2e\\src\\Resources\\Configuration\\ConfigurationExcel.xlsx";
        var cellValue = "";
        var wb = new Workbook();
        await wb.xlsx.readFile(filePath);
        var sheet = wb.getWorksheet("ProtractorConfig");
        var rowObject = sheet.getRow(1);

        for (var j = 1; j <= sheet.columnCount; j++) {
            if (!matchFlag) {
                var cellObject = rowObject.getCell(j);
                if (cellObject.toString().trim().toLowerCase() === columnName.trim().toLowerCase()) {
                    var row2Obj = sheet.getRow(2);
                    cellValue = row2Obj.getCell(j).toString().trim();
                    matchFlag = true;
                }
            }
        }
        return cellValue;
    }
}
module.exports = jsUtility;