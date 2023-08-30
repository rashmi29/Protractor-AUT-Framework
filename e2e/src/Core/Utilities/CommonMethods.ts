import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions } from "protractor";
import { protractor } from "protractor/built/ptor";
import { By } from 'selenium-webdriver';
import { getLogger } from "log4js";
import { day, month } from "@data/enum";
const logger = getLogger('QA_LOGS');

export class CommonMethods {

    /**
     * Open url in browser
     * @author Rashmi Patel
     * @param url - Url to be opened in browser
     * @returns Promise<boolean> 
     */
    async launchURL(url: string): Promise<boolean> {
        try {
            await browser.get(url);
            logger.info("URL is launched : " + url);
            return true;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><launchURL> : " + (<Error>error).message);
            return false;
        }
    }


    /**
     * method takes By locator and returns element
     * @author Rashmi Patel
     * @param locator - locator to identify element uniquely
     * @returns Promise<ElementFinder> located element
     */
    async objectLocater(locator: By): Promise<ElementFinder> {
        try {
            await this.waitUntillElementIsVisible(locator, 30000);

            let objEle: ElementFinder = element(locator);
            if (objEle.isDisplayed() || objEle.isEnabled()) {
                await this.objHig(objEle);
                logger.debug("object is Visible/Enabled : " + locator);
                return objEle;
            } else {
                logger.debug("object has not built : " + locator);
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><objectLocater> for locator: " + locator + ". Error : " + (<Error>error).message);
        }
    }


    /**
     * Objects locator
     * Takes By locator and returns all element
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns ElementArrayFinder all located elements
     */
    objectsLocator(locator: By): ElementArrayFinder {
        return element.all(locator);
    }


    /**
     * Objhig
     * Takes element and highlight that element with red box
     * @author Rashmi Patel
     * @param element - Elementto be highlighted
     */
    async objHig(element: ElementFinder): Promise<void> {
        await browser.executeScript("arguments[0].style.border='3px solid red'", element);
    }


    /**
     * Sendkeys
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param text  - text to be entered on textfield
     * @returns Promise<boolean> 
     */
    async sendKeys(locator: By, text: string): Promise<boolean> {
        let flag: boolean;
        try {
            let ele: ElementFinder = await this.objectLocater(locator);
            await ele.clear();
            await ele.sendKeys(text);
            flag = true;
            logger.debug("Entering text in field with locator : " + locator);
        } catch (error) {
            flag = false;
            logger.error("EXCEPTION: Exception at <CommonMethods><sendKeys> : " + (<Error>error).message);
        }
        return flag;
    }


    /**
     * Gettext
     * Takes locator and returns text from that element
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns - Promise<string>
     */
    async getText(locator: By): Promise<string> {
        try {
            logger.debug("Getting text of element with locator : " + locator);
            return await (await this.objectLocater(locator)).getText();
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><getText> : " + (<Error>error).message);
            return element(locator).getText();
        }
    }


    /**
     * Gets text using js
     * Takes locator and get text using javascript
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns text using js 
     */
    async getTextUsingJS(locator: By): Promise<String> {
        try {
            const ele: ElementFinder = await this.objectLocater(locator);
            if (await ele.isPresent()) {
                const elementID: string = await ele.getAttribute("id");
                if (elementID.length > 0) {
                    const jsString = "return document.getElementById('" + elementID + "').value";
                    logger.debug("Getting text of element with locator using js : " + locator);
                    return await browser.executeScript(jsString, ele);
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><getTextUsingJS> : " + (<Error>error).message);
        }
    }


    /**
     * clickIt
     * Takes locator and click on that element - Button, link, radiobutton
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns - Promise<boolean>
     */
    async clickIt(locator: By): Promise<boolean> {
        try {
            await (await this.objectLocater(locator)).click();
            logger.debug("Clinking on element with locator : " + locator);
            return true;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><clickIt> : " + (<Error>error).message);
            return false;
        }
    }


    /**
     * selectDDValue
     * Selects given value in dropdown
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param txtVar - option to be selected on dropdown
     */
    async selectDDValue(locator: By, txtVar: string) {
        try {
            const selectElement: ElementFinder = await this.objectLocater(locator);
            await selectElement.click();
            await browser.sleep(2000);
            const idString = await selectElement.getAttribute('aria-owns');
            const idArr: string[] = idString.split(' ');
            if (idArr.length > 0) {
                for (let i = 0; i < idArr.length; i++) {
                    const eleID: string = idArr[i];
                    const optionEle: ElementFinder = element(by.id(eleID));
                    const actualTxt: string = await optionEle.getText();
                    if (actualTxt.trim().toLowerCase() === txtVar.trim().toLowerCase()) {
                        await optionEle.click();
                        logger.debug("Selecting value: " + txtVar + " in dropdown element with locator : " + locator);
                        return;
                    }
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><selectDDValue> : " + (<Error>error).message);
        }
    }


    /**
     * selectDDValues
     * Select all given values in dropdown
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param optionsToSelect - array with all values to be selected
     */
    async selectDDValues(locator: By, optionsToSelect: string[]) {
        try {
            let counter: number = 0;
            const selectElement: ElementFinder = await this.objectLocater(locator);
            await selectElement.click();
            await browser.sleep(2000);
            const idString = await selectElement.getAttribute('aria-owns');
            const idArr: string[] = idString.split(' ');
            if (idArr.length > 0) {
                for (let i = 0; i < idArr.length; i++) {
                    const eleID: string = idArr[i];
                    const optionEle: ElementFinder = element(by.id(eleID));
                    const actualTxt: string = await optionEle.getText();
                    for (let j = 0; j < optionsToSelect.length; j++) {
                        if (actualTxt.trim().toLowerCase() === optionsToSelect[j].trim().toLowerCase()) {
                            await optionEle.click();
                            counter = counter + 1;
                        }
                    }
                }
                if (counter === optionsToSelect.length) {
                    await selectElement.sendKeys(protractor.Key.TAB);
                    logger.debug("Selecting multiple values in dropdown element with locator : " + locator);
                    return;
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><selectDDValues> : " + (<Error>error).message);
        }
    }


    /**
     * Check if checkbox is selected or not
     * @author Rashmi Patel
     * @param locator  - locator to identify element
     * @returns : Promise<boolean> 
     */
    async isChecked(locator: By): Promise<boolean> {
        try {
            const ele: ElementFinder = await this.objectLocater(locator);
            if ((await ele.getAttribute('class')).includes('checked')) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><isChecked> : " + (<Error>error).message);
            return false;
        }
    }


    /**
     * Select checkbox
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns  Promise<boolean>
     */
    async selectChkbox(locator: By): Promise<boolean> {
        try {
            const ele: ElementFinder = await this.objectLocater(locator);
            const eleStatus: boolean = await this.isChecked(locator);
            if (!eleStatus) {
                await ele.click();
                return true;
            }
            logger.debug("Selecting checkbox with locator : " + locator);
            return false;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><selectChkbox> : " + (<Error>error).message);
            return false;
        }
    }

    /**
     * Unselects checkbox
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns Promise<boolean>
     */
    async unselectChkbox(locator: By): Promise<boolean> {
        try {
            const ele: ElementFinder = await this.objectLocater(locator);
            const eleStatus: boolean = await this.isChecked(locator);
            if (eleStatus) {
                await ele.click();
                return true;
            }
            logger.debug("Unselecting checkbox with locator : " + locator);
            return false;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><unselectChkbox> : " + (<Error>error).message);
            return false;
        }
    }


    /**
     * Waits untill element is visible
     * @author Rashmi Patel
     * @param locator  - locator to identify element
     * @param timeToWait  - time to wait in miliseconds
     * @returns untill element is visible 
     */
    async waitUntillElementIsVisible(locator: By, timeToWait: number): Promise<void> {
        try {
            const expectedCondition = ExpectedConditions;
            await browser.wait(await expectedCondition.visibilityOf(element(locator)), timeToWait);
            logger.debug("Waiting for element to be visible with locator : " + locator);
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><waitUntillElementIsVisible> : " + (<Error>error).message);
            return;
        }
    }


    /**
     * Waits untill element is visible by element
     * @author Rashmi Patel
     * @param element - Elemnt for which method needs to wait
     * @param timeToWait - time to wait in miliseconds
     * @returns untill element is visible by element 
     */
    async waitUntillElementIsVisibleByElement(element: ElementFinder, timeToWait: number): Promise<void> {
        try {
            const expectedCondition = ExpectedConditions;
            await browser.wait(await expectedCondition.visibilityOf(element), timeToWait);
            logger.debug("Waiting for element to be visible");
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><waitUntillElementIsVisible> : " + (<Error>error).message);
            return;
        }
    }


    /**
     * Waits untill invisibility of element
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param timeToWait - time to wait in miliseconds
     * @returns untill invisibility of element 
     */
    async waitUntillInvisibilityOfElement(locator: By, timeToWait: number): Promise<void> {
        try {
            const expectedCondition = ExpectedConditions;
            await browser.wait(await expectedCondition.invisibilityOf(element(locator)), timeToWait);
            await browser.sleep(2000);
            logger.debug("Waiting for element to be invisible with locator : " + locator);
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><waitUntillInvisibilityOfElement> : " + (<Error>error).message);
            return;
        }
    }


    /**
     * Waits untill element is clickable
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param timeToWait - time to wait in miliseconds
     * @returns untill element is clickable 
     */
    async waitUntillElementIsClickable(locator: By, timeToWait: number): Promise<void> {
        try {
            const expectedCondition = ExpectedConditions;
            await browser.wait(await expectedCondition.elementToBeClickable(element(locator)), timeToWait);
            logger.debug("Waiting for element to be clickable with locator : " + locator);
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><waitUntillElementIsClickable> : " + (<Error>error).message);
            return;
        }
    }


    /**
     * Enters text in autocompleter and select exact match fromm result
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param optionToSelect - option to select fromm list
     */
    async enterAndSelectExactMatch(locator: By, optionToSelect: string) {
        try {
            const inputElement: ElementFinder = await this.objectLocater(locator);
            let matchStatus: boolean = false;

            await inputElement.sendKeys(optionToSelect);
            await browser.sleep(3000);

            const idString: string = await inputElement.getAttribute('aria-owns');
            const parentOptionElement: ElementFinder = element(by.id(idString));

            const noOfOptions: number = await parentOptionElement.all(by.tagName('mat-option')).count();
            const optionElements: ElementArrayFinder = parentOptionElement.all(by.tagName('mat-option'));
            for (let i = 0; i < noOfOptions; i++) {
                if (!matchStatus) {
                    const option: ElementFinder = optionElements.get(i);
                    const optionElementPresent: boolean = await option.isPresent();
                    if (optionElementPresent) {
                        const actualText: string = await option.getText();
                        if (actualText.trim().toLowerCase() === optionToSelect.trim().toLowerCase()) {
                            await option.click();
                            await browser.sleep(1000);
                            matchStatus = true;
                            logger.debug("Selecting  " + actualText + " in autocompleter with locator: " + locator);
                        }
                    }
                }
            }

        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><enterAndSelectExactMatch> : " + (<Error>error).message);
        }
    }


    /**
     * Enters text in autocompleter and select exact match fromm result
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @param optionToSelect - option to select fromm list
     */
    async enterAndSelectContainsMatch(locator: By, optionToSelect: string) {
        try {
            const inputElement: ElementFinder = await this.objectLocater(locator);
            let matchStatus: boolean = false;

            await inputElement.sendKeys(optionToSelect);
            await browser.sleep(5000);

            const idString: string = await inputElement.getAttribute('aria-owns');
            const parentOptionElement: ElementFinder = element(by.id(idString));

            const noOfOptions: number = await parentOptionElement.all(by.tagName('mat-option')).count();
            const optionElements: ElementArrayFinder = parentOptionElement.all(by.tagName('mat-option'));
            for (let i = 0; i < noOfOptions; i++) {
                if (!matchStatus) {
                    const option: ElementFinder = optionElements.get(i);
                    const optionElementPresent: boolean = await option.isPresent();
                    if (optionElementPresent) {
                        const actualText: string = await option.getText();
                        if ((actualText.trim().toLowerCase()).includes(optionToSelect.trim().toLowerCase())) {
                            await option.click();
                            await browser.sleep(1000);
                            matchStatus = true;
                            logger.debug("Selecting  " + actualText + " in autocompleter with locator: " + locator);
                        }
                    }
                }
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><enterAndSelectContainsMatch> : " + (<Error>error).message);
        }
    }


    /**
     * Click on dropdown and randomly select any value
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns selected option
     */
    async selectRandomData(locator: By): Promise<string> {
        try {
            const selectElement: ElementFinder = await this.objectLocater(locator);
            await selectElement.click();
            await browser.sleep(1000);

            const idString = await selectElement.getAttribute('aria-owns');
            const idArr: string[] = idString.split(' ');
            const count: number = idArr.length;

            let randomIndex: number = 0;
            randomIndex = Math.floor(Math.random() * count);
            const optionElement: ElementFinder = element(by.id(idArr[randomIndex]));
            const selectedOption: string = await optionElement.getText();
            await optionElement.click();
            logger.debug("Selecting  " + selectedOption + " from dropdown with locator: " + locator);
            return selectedOption;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><selectRandomData> : " + (<Error>error).message);
        }
    }


    /**
     * Determines whether element is present
     * @author Rashmi Patel
     * @param locator - locator to identify element
     * @returns true if element present else false
     */
    async isElementPresent(locator: By): Promise<boolean> {
        try {
            logger.debug("Checking that element with locator : " + locator + " is present");
            return await element(locator).isPresent();
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><isElementPresent> : " + (<Error>error).message);
            return false;
        }
    }


    /**
     * Generates random alphanumeric string
     * @author Rashmi Patel
     * @param len - length of string
     * @returns generated random string 
     */
    generateRandomString(len: number): string {
        const standardStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys0123456789";
        let randomString = "";

        for (let i = 0; i < len; i++) {
            randomString = randomString + standardStr.charAt(Math.floor(Math.random() * standardStr.length));
        }
        return randomString;
    }


    /**
     * Generates random number
     * @author Rashmi Patel
     * @param len - length of number
     * @returns generated random number string
     */
    generateRandomNumber(len: number): string {
        const standardStr = "0123456789";
        let randomString = "";

        for (let i = 0; i < len; i++) {
            randomString = randomString + standardStr.charAt(Math.floor(Math.random() * standardStr.length));
        }
        return randomString;
    }

    /**
     * Selects calender date
     * @param date_DD - Date value from enum
     * @param month_MM - month value from enum
     * @param year_YYYY - year value
     * @returns calender date - date formate in MM/DD/YYYY
     * @author Rashmi Patel
     */
    async selectCalenderDate(date_DD: day, month_MM: month, year_YYYY: string): Promise<string> {
        try {
            const calenderEle: ElementFinder = element(by.tagName("mat-datepicker-toggle"));
            const buttPeriod: ElementFinder = element(by.xpath("//*[contains(@class,'mat-calendar-period-button')]"));

            await calenderEle.click();

            const periodText = await buttPeriod.getText();
            const month = periodText.split(" ")[0];
            const year = periodText.split(" ")[1];

            if ((year_YYYY !== year) || (month_MM.toUpperCase() !== month.toUpperCase())) {
                await buttPeriod.click();
                const yearEle: ElementFinder = element(by.xpath("//div[text()='" + year_YYYY + "']"));
                await yearEle.click();

                const monthEle: ElementFinder = element(by.xpath("//div[text()='" + month_MM.toString().toUpperCase() + "']"));
                await monthEle.click();

                const dateEle: ElementFinder = element(by.xpath("//div[text()='" + date_DD.toString() + "']"));
                await dateEle.click();
            } else {
                const dateEle: ElementFinder = element(by.xpath("//div[text()='" + date_DD.toString() + "']"));
                await dateEle.click();
            }

            let expDate: string = month_MM.toString() + "/" + date_DD.toString() + "/" + year_YYYY;
            expDate = (new Date(expDate).getMonth() + 1) + "/" + (new Date(expDate).getDate()) + "/" + year_YYYY;
            return expDate;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><selectCalenderDate> : " + (<Error>error).message);
            return "";
        }
    }

    /**
     * Gets all options value from dropdown
     * @param locator - locator to identify element
     * @returns all options 
     * @author - Rashmi Patel
     */
    async getAllOptions(locator: By): Promise<string[]> {
        try {
            let optionValues: string[] = [];
            const selectElement: ElementFinder = await this.objectLocater(locator);
            await selectElement.click();
            await browser.sleep(2000);
            const idString = await selectElement.getAttribute('aria-owns');
            const idArr: string[] = idString.split(' ');
            if (idArr.length > 0) {
                for (let i = 0; i < idArr.length; i++) {
                    const eleID: string = idArr[i];
                    const optionEle: ElementFinder = element(by.id(eleID));
                    optionValues[i] = await optionEle.getText();
                }

                await element(by.id(idArr[0])).click();
            }
            return optionValues;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><getAllOptions> : " + (<Error>error).message);
        }
    }

    /**
     * Clicks using js
     * @param locator  - locator to identify element
     * @returns - Promise<boolean>
     * @author - Rashmi Patel
     */
    async clickUsingJS(locator: By): Promise<boolean> {
        try {
            const ele: ElementFinder = await this.objectLocater(locator);
            await browser.executeScript("arguments[0].click();", ele.getWebElement());
            return true;
        } catch (error) {
            logger.error("EXCEPTION: Exception at <CommonMethods><clickUsingJS> : " + (<Error>error).message);
            return false;
        }
    }
}