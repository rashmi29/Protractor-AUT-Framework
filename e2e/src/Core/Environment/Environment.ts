import { browser } from "protractor";
import { getLogger } from "log4js";
import { EnvironmentData } from "@data/EnvironmentData";
const logger = getLogger('QA_LOGS');

export class Environment {
    static url: string;
    setEnvironmentData(): void {
        try {
            const getEnv = browser.params.environment.env;
            switch (getEnv) {
                case 'DEV':
                    Environment.url = EnvironmentData.devUrl;
                    return;
                case 'QA':
                    Environment.url = EnvironmentData.qaUrl;
                    return;
            }
        } catch (error) {
            logger.error("EXCEPTION: Exception at <Environment><setEnvironmentData> : " + (<Error>error).message);
        }
    }
}