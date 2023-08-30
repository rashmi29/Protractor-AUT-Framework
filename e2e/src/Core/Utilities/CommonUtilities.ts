import { zip } from "zip-a-folder";
import * as CryptoJS from "crypto-js";
import { getLogger } from "log4js";
import * as nodemailer from "nodemailer";
import { EXCEL_TYPE, RWExcel } from "./RWExcel"
import { CommonMethods } from "./CommonMethods";
import * as fs from "fs";
import * as path from "path";
const logger = getLogger('QA_LOGS');
import { Workbook, Worksheet, Row, Cell } from 'exceljs';
import { By } from 'selenium-webdriver';
import { browser, by, ElementArrayFinder, ElementFinder } from "protractor";


export class CommonUtilities {
    private objCM: CommonMethods;

    constructor() {
        this.objCM = new CommonMethods();
    }
    /**
     * Sends email
     * @author Rashmi Patel
     * @returns true if email is sent 
     */
    async sendEmail(): Promise<boolean> {
        const objRWexcel = new RWExcel();
        const sheetName = "EmailConfig";
        let flag: boolean = false;

        const transport = nodemailer.createTransport({
            host: await objRWexcel.readCell(sheetName, "host_transport", EXCEL_TYPE.CONFIGURATION),
            port: await objRWexcel.readCell(sheetName, "port_transport", EXCEL_TYPE.CONFIGURATION),
            secure: await objRWexcel.readCell(sheetName, "secure_transport", EXCEL_TYPE.CONFIGURATION),
            auth: {
                user: await objRWexcel.readCell(sheetName, "username_transport", EXCEL_TYPE.CONFIGURATION),
                pass: await objRWexcel.readCell(sheetName, "password_transport", EXCEL_TYPE.CONFIGURATION)
            }
        });

        const mailOptions = {
            from: await objRWexcel.readCell(sheetName, "from_mailOption", EXCEL_TYPE.CONFIGURATION),
            to: await objRWexcel.readCell(sheetName, "to_mailOption", EXCEL_TYPE.CONFIGURATION),
            subject: await objRWexcel.readCell(sheetName, "subject_mailOption", EXCEL_TYPE.CONFIGURATION),
            html: await objRWexcel.readCell(sheetName, "bodyHtml_mailOption", EXCEL_TYPE.CONFIGURATION),
            attachments: [{
                path: await objRWexcel.readCell(sheetName, "attachmentPath_mailOption", EXCEL_TYPE.CONFIGURATION)
            }]
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error("ERROR at <CommonUtilities><sendEmail> : " + (<Error>error).message);
                flag = false;
            }
            logger.info("Message sent: " + info.response);
            flag = true;
        });
        return flag;
    }


    /**
     * Zips a folder - zip a source folder and save it to destination path with specifed zip file name
     * @author Rashmi Patel
     * @param srcFolderPath - folder path to be zipped
     * @param destFolderPath - folder path where zipped file needs to be saved
     * @param zipFileName - Zip file name
     */
    async zipAfolder(srcFolderPath: string, destFolderPath: string, zipFileName: string) {
        try {
            await zip(srcFolderPath, destFolderPath + "/" + zipFileName);
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonUtilities><zipAfolder> : " + (<Error>error).message);
        }
    }


    /**
     * Encrypts data - encrypt given data with specific key
     * @author Rashmi Patel
     * @param strToEncrypt - data to be encrypted
     * @param key - Key used for encryption
     * @returns data - encrypted data string
     */
    encryptData(strToEncrypt: string, key: string): string {
        try {
            return CryptoJS.AES.encrypt(strToEncrypt, key);
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonUtilities><encryptData> : " + (<Error>error).message);
        }
    }


    /**
     * Decrypts data - decrypt given data with speified key
     * @author Rashmi Patel
     * @param ciphertext - encrypted data string
     * @param key - Key used for encryption
     * @returns data - decrypted data string
     */
    decryptData(ciphertext: string, key: string): string {
        try {
            let bytes = CryptoJS.AES.decrypt(ciphertext, key);
            let originalText = bytes.toString(CryptoJS.enc.Utf8);
            return originalText;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonUtilities><decryptData> : " + (<Error>error).message);
        }
    }

    async validateDownloadXlsx(chkboxLocator: By, buttDownloadLocator: By, fileName: string): Promise<boolean> {
        try {
            let DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads/');
            if (fs.existsSync(DOWNLOAD_DIR + fileName)) {
                fs.unlinkSync(DOWNLOAD_DIR + fileName);
            }

            await this.objCM.selectChkbox(chkboxLocator);
            await this.objCM.clickIt(buttDownloadLocator);
            await browser.sleep(5000);

            await browser.driver.wait(function () {
                return fs.existsSync(DOWNLOAD_DIR + fileName);
            }, 30000);

            if (fs.existsSync(DOWNLOAD_DIR + fileName)) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonFunctionality><validateDownloadXlsx> : " + (<Error>error).message);
            return false;
        }
    }

    async validateExcelData(tableElementLocator: By, filename: string, sheetName: string): Promise<String> {
        try {
            // Get Data from result table on UI
            const expectedData = await this.getResultTableData(tableElementLocator);

            // Get data from downloaded excel
            let actualData = [];
            let DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads/');
            if (fs.existsSync(DOWNLOAD_DIR + filename)) {
                let wb: Workbook = new Workbook();
                await wb.xlsx.readFile(DOWNLOAD_DIR + filename);
                let sheet: Worksheet = wb.getWorksheet(sheetName);

                for (let i = 2; i <= sheet.rowCount; i++) {
                    actualData[i - 2] = [];
                    let rowObject: Row = sheet.getRow(i);
                    for (let j = 1; j <= sheet.columnCount; j++) {
                        let cellObject: Cell = rowObject.getCell(j);
                        actualData[i - 2][j - 1] = cellObject.toString().trim();
                    }
                }

                // Compare two arrays
                if (actualData.length === expectedData.length) {
                    for (let i = 0; i < actualData.length; i++) {
                        for (let j = 0; j < actualData[i].length; j++) {
                            if (actualData[i][j] === expectedData[i][j]) {
                                console.log("pass");
                            } else {
                                console.log("fail");
                            }
                        }
                    }
                } else {
                    return "Row count is not matching";
                }
                return "true";
            } else {
                return "false";
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonFunctionality><validateExcelData> : " + (<Error>error).message);
            return "false";
        }
    }

    async getResultTableData(tableElementLocator: By): Promise<string[]> {
        try {
            let data = [];
            const tableEle: ElementFinder = await this.objCM.objectLocater(tableElementLocator);
            const trEles: ElementArrayFinder = tableEle.all(by.tagName("tr"));

            for (let i = 1; i < await trEles.count(); i++) {
                data[i - 1] = [];
                const tdEles: ElementArrayFinder = trEles.get(i).all(by.tagName("td"));
                for (let j = 1; j < await tdEles.count() - 1; j++) {
                    data[i - 1][j - 1] = await (await tdEles.get(j).getText()).trim();
                }
            }
            return data;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonFunctionality><getResultTableData> : " + (<Error>error).message);
        }
    }

    async validateUniqueSearhResult(searchText: string, columnName: string, tableElemenLocator: By): Promise<boolean> {
        try {
            const tableEle: ElementFinder = await this.objCM.objectLocater(tableElemenLocator);
            const trEles: ElementArrayFinder = tableEle.all(by.tagName("tr"));
            const colIndex: number = await this.getColumnIndex(tableEle, columnName);
            for (let i = 1; i < (await trEles).length; i++) {
                const tdEles: ElementArrayFinder = trEles.get(i).all(by.tagName("td"));
                const actualText: string = await tdEles.get(colIndex).getText();
                if (actualText.toLowerCase().trim() === searchText.toLowerCase().trim()) {
                    return true;
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonFunctionality><validateUniqueSearhResult> : " + (<Error>error).message);
            return false;
        }
    }

    async getColumnIndex(tableElement: ElementFinder, columnName: string): Promise<number> {
        try {
            let matchStatus: boolean = false;
            const tableEle: ElementFinder = tableElement;
            const firstRow: ElementFinder = tableEle.all(by.tagName('tr')).get(0);
            const thEles: ElementArrayFinder = firstRow.all(by.tagName("th"));
            let colIndex: number = 1;
            for (let i = 1; i < await thEles.count(); i++) {
                if (!matchStatus) {
                    const actualHeader: string = await thEles.get(i).getText();
                    if (actualHeader.toLowerCase().trim() === columnName.toLowerCase().trim()) {
                        matchStatus = true;
                        colIndex = i
                    }
                }
            }
            return colIndex;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonFunctionality><getColumnIndex> : " + (<Error>error).message);
        }
    }
}