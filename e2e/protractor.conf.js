const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');
var HtmlReporter = require('protractor-beautiful-reporter');
const jsUtility = require('./src/Core/Utilities/js-utility');
const log4js = require('log4js');
const tsConfig = require('./tsconfig.json');
const path = require('path');

exports.config = {
  allScriptsTimeout: 60000,      // Sets the amount of time to wait for an asynchronous script to finish execution before throwing an error.
  capabilities: {
    browserName: 'chrome',        // Browser where test cases need to be executed
    chromeOptions: {
      args: [
        // "--headless",             // To run browser in headless mode
        "--window-size=1920,1080" // To open browser in specific window size while running in headless mode
      ]
    },
    prefs: {                      // To specify file download related settings
      'download': {
        'prompt_for_download': false,
        'default_directory': path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads/'),
      }
    }
  },
  directConnect: true,              // If this is true, settings for seleniumAddress and seleniumServerJar will be ignored - for chrome & firefox
  SELENIUM_PROMISE_MANAGER: false,  // To disable control flow
  framework: 'jasmine',             // Test framework
  suites: {
    regression: [
      "../e2e/src/TestCases/submit-form-spec.ts"
    ],
    smoke: [
      "../e2e/src/TestCases/submit-form-spec.ts"
    ]
  },

  jasmineNodeOpts: {
    showColors: true,                 // If true, print colors to the terminal.
    defaultTimeoutInterval: 1000000,  // Default time to wait in ms before a test fails.
    print: function () { }            // If set, only execute specs whose names match the pattern, which is internally compiled to a RegExp.
  },
  async onPrepare() {
    const globals = require("protractor");

    require('ts-node').register({
      project: "e2e/tsconfig.json"
    });

    require('tsconfig-paths').register({
      project: "e2e/tsconfig,json",
      baseUrl: './',
      paths: tsConfig.compilerOptions.paths
    });

    const browser = globals.browser;
    await browser.manage().window().maximize();
    await browser.manage().timeouts().implicitlyWait(5000);

    jasmine.getEnv().addReporter(new SpecReporter({       // Add jasmine-spec-reporter
      spec: {
        displayStacktrace: StacktraceOption.NONE,         // Display failed stacktrace for each failed assertion
        displaySuccessful: true,                          // Displaye each successful specs
        displayFailed: true,                              // Displaye each failed specs
        displayPending: true,                             // Displaye each pending specs
        displayErrorMessages: true                        // Display error messages for each failed assrtions
      },
      colors: {
        successful: "green",                              // Color for successful spec
        failed: "red",                                    // Color for failed spec
        pending: "yellow"                                 // Color for pending spec
      }
    }));

    var jsUtil = new jsUtility();
    var baseDirectory = 'e2e-reports/e2e_report_' + jsUtil.getTimeStamp();

    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: baseDirectory,                      // Directory where report will be saved
      docTitle: await jsUtil.readCell("DOCUMENT_TITLE"), // Document title
      docName: await jsUtil.readCell("DOCUMENT_NAME"),   // Document name (report file name)
      screenshotsSubfolder: await jsUtil.readCell("SCREENSHOT_SUBFOLDER"), // Screenshot folder
      excludeSkippedSpecs: true,                         // Exclude reporting skipped test cases entirely
      takeScreenShotsOnlyForFailedSpecs: await jsUtil.readCell("takeScreenShotsOnlyForFailedSpecs"),  // Screenshpt will be captired for failed spec only
      gatherBrowserLogs: await jsUtil.readCell("gatherBrowserLogs"),      // Set true to gather browser logs in report
      jsonsSubfolder: 'jsons',
      clientDefaults: {                     // Client specific report settings
        showTotalDurationIn: "header",      // Place where time should be displayed (available option "header", "belowHeader", "footer")
        totalDurationFormat: "hms",         // Timem format (Options available "h", "m", "s", "hm", "h:m", "hms", "h:m:s" and "ms")
        searchSettings: {                   // Set all button status in the search
          allselected: false,
          passed: true,
          failed: true,
          pending: false,
          withLog: false
        },
        columnSettings: {                   // Columns to be displayed in report
          displayTime: true,
          displayBrowser: false,
          displaySessionId: false,
          displayOS: false,
          inlineScreenshots: false
        }
      }
    }).getJasmine2Reporter());

    // log4js logger configuration
    log4js.configure({
      appenders: {
        file: {
          type: "file",
          filename: "e2e-logs/e2e-run-log-" + jsUtil.getTimeStamp() + ".log",
          maxLogSize: 20 * 1024 * 1024, // 10Mb
          numBackups: 5,                //Keep five backup files
          compress: false,
          flags: 'w+'
        },
        out: {
          type: "stdout",
          layout: {
            type: "colored"
          }
        }
      },
      categories: {
        default: {
          appenders: ["file", "out"],
          level: "debug"
        }
      }
    });

    // To allow file download in headless mode
    browser.driver.sendChromiumCommand('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads/')
    });
  }
};