import { Environment } from "@core/Environment/Environment";
import { HomePageBL } from "@page/HomePage/HomePageBL";
import { FormData } from "@data/formData";
import { getLogger } from "log4js";
import { browser } from "protractor";
import { EXCEL_TYPE, RWExcel } from "@core/Utilities/RWExcel";
const logger = getLogger('QA_LOGS');

describe("ProtoCommerce: Home", () => {
    let objHomeBL: HomePageBL = new HomePageBL();
    beforeAll(async () => {
        const objEnv = new Environment();
        await browser.waitForAngularEnabled(false);

        objEnv.setEnvironmentData();
        await browser.get(Environment.url);
        await browser.manage().deleteAllCookies();
    });
    it("Verify that user is able to submit form successfully with valid details.", async () => {
        logger.info("Verify that user is able to submit form successfully with valid details");

        await objHomeBL.openApplication(Environment.url);
        await objHomeBL.submitForm(FormData.name, FormData.email, FormData.password);

        expect(await objHomeBL.validateSuccessMessage()).toBe(true, "Form submit success message validation");
    });
    it("Verify that user is able to submit form successfully with valid details from test data excel.", async () => {
        logger.info("Verify that user is able to submit form successfully with valid details from test data excel");
        let objRWexcel = new RWExcel();

        let name = await objRWexcel.readCell("FormData", "Name", EXCEL_TYPE.TEST_DATA);
        let email = await objRWexcel.readCell("FormData", "Email", EXCEL_TYPE.TEST_DATA);
        let pwd = await objRWexcel.readCell("FormData", "Password", EXCEL_TYPE.TEST_DATA);

        await objHomeBL.openApplication(Environment.url);
        await objHomeBL.submitForm(name, email, pwd);

        expect(await objHomeBL.validateSuccessMessage()).toBe(true, "Form submit success message validation");
    });
});