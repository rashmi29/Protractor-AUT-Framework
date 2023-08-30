import { Workbook, Worksheet, Row, Cell, ValueType } from 'exceljs';
import { getLogger } from "log4js";
const logger = getLogger('QA_LOGS');

export class RWExcel {

    /**
     * Reads cell - This will read a cell matching to specific column and row 2
     * @author Rashmi Patel
     * @param sheetName -  Worksheet name
     * @param columnName - Column Name
     * @param excelType - exceltype enum value (CONFIGURATION/TEST_DATA)
     * @returns cell value string
     */
    async readCell(sheetName: string, columnName: string, excelType: EXCEL_TYPE): Promise<string> {
        try {
            let filePath: string = process.cwd() + excelType.toString();
            let cellValue = "", matchFlag = false;
            let wb: Workbook = new Workbook();
            await wb.xlsx.readFile(filePath);
            let sheet: Worksheet = wb.getWorksheet(sheetName);
            let rowObject: Row = sheet.getRow(1);

            for (let i = 1; i <= sheet.columnCount; i++) {
                if (!matchFlag) {
                    let cellObject: Cell = rowObject.getCell(i);
                    if (cellObject.toString().trim().toLowerCase() === columnName.trim().toLowerCase()) {
                        cellValue = sheet.getRow(2).getCell(i).toString().trim();
                        return cellValue;
                    }
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <RWExcel><readCell> : " + (<Error>error).message);
        }
    }


    /**
     * Reads col values - Read all row values fromm particular column
     * @author Rashmi Patel
     * @param sheetName -  Worksheet name
     * @param columnName - Column Name
     * @param excelType - exceltype enum value (CONFIGURATION/TEST_DATA)
     * @returns col values array
     */
    async readColValues(sheetName: string, columnName: string, excelType: EXCEL_TYPE): Promise<string[]> {
        try {
            let values: string[] = [], colIndex: number, matchFlag: boolean = false;
            let filePath: string = process.cwd() + excelType.toString();
            let wb: Workbook = new Workbook();
            await wb.xlsx.readFile(filePath);
            let sheet: Worksheet = wb.getWorksheet(sheetName);
            let rowCount = sheet.rowCount;
            let firstRow: Row = sheet.getRow(1);

            for (let j = 1; j <= sheet.columnCount; j++) {
                if (!matchFlag) {
                    let cellObject: Cell = firstRow.getCell(j);
                    if (cellObject.toString().trim().toLowerCase() === columnName.trim().toLowerCase()) {
                        colIndex = j;
                        matchFlag = true;
                        for (let k = 2; k <= rowCount; k++) {
                            let rowObject: Row = sheet.getRow(k);
                            let type: ValueType = rowObject.getCell(colIndex).type;
                            values[k - 2] = rowObject.getCell(colIndex).toString().trim();
                        }
                    }
                }
            }
            return values;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <RWExcel><readColValues> : " + (<Error>error).message);
        }
    }


    /**
     * Reads row data - Reads specific column value with column name as well
     * @author Rashmi Patel
     * @param sheetName - Worksheet name
     * @param excelType - exceltype enum value (CONFIGURATION/TEST_DATA)
     * @returns row data map with columnname as key and rowdata as value
     */
    async readRowData(sheetName: string, excelType: EXCEL_TYPE): Promise<Map<string, string>> {
        try {
            let dataMap = new Map<string, string>();
            let filePath: string = process.cwd() + excelType.toString();
            let wb: Workbook = new Workbook();
            await wb.xlsx.readFile(filePath);
            let sheet: Worksheet = wb.getWorksheet(sheetName);
            let colCount = sheet.columnCount;
            let headerRow: Row = sheet.getRow(1);
            let dataRow: Row = sheet.getRow(2);

            for (let i = 1; i <= colCount; i++) {
                let header: string = headerRow.getCell(i).toString().trim();
                let value: string = dataRow.getCell(i).toString().trim();
                dataMap.set(header, value);
            }
            return dataMap;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <RWExcel><readRowData> : " + (<Error>error).message);
        }
    }
}

export enum EXCEL_TYPE {
    "CONFIGURATION" = "\\e2e\\src\\Resources\\Configuration\\ConfigurationExcel.xlsx",
    "TEST_DATA" = "\\e2e\\src\\Resources\\TestData\\TestData.xlsx",
}

