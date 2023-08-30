import { CommonMethods } from '../../Core/Utilities/CommonMethods';
import { HomePageOR } from './HomePageOR';
import { getLogger } from "log4js";
import { browser } from 'protractor';
const logger = getLogger('QA_LOGS');

export class HomePageBL {

  private objCM: CommonMethods;
  private objHomeOR: HomePageOR;

  constructor() {
    this.objHomeOR = new HomePageOR();
    this.objCM = new CommonMethods();
  }

  async openApplication(url: string): Promise<void> {
    try {
      await browser.waitForAngularEnabled(false);

      await this.objCM.launchURL(url);
      await this.objCM.waitUntillElementIsVisible(this.objHomeOR.txtName, 30000);
    } catch (error) {
      logger.error("EXCEPTION: Exception at <HomePageBL><openApplication> : " + (<Error>error).message);
    }
  }
  async submitForm(name: string, email: string, pwd: string): Promise<boolean> {
    try {
      await this.objCM.sendKeys(this.objHomeOR.txtName, name);
      await this.objCM.sendKeys(this.objHomeOR.txtEmail, email);
      await this.objCM.sendKeys(this.objHomeOR.txtPassword, pwd);
      await this.objCM.clickIt(this.objHomeOR.buttSubmit);
      return true;
    } catch (error) {
      logger.error("EXCEPTION: Exception at <HomePageBL><submitForm> : " + (<Error>error).message);
      return false;
    }
  }

  async validateSuccessMessage(): Promise<boolean> {
    try {
      return await this.objCM.isElementPresent(this.objHomeOR.successMessage);
    } catch (error) {
      logger.error("EXCEPTION: Exception at <HomePageBL><validateSuccessMessage> : " + (<Error>error).message);
      return false;
    }
  }
}
