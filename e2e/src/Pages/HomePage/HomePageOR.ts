import { By } from 'selenium-webdriver';
import { by } from 'protractor'

export class HomePageOR {

    txtName: By = by.xpath("//*[@name='name' and contains(@class,'form-control')]");
    txtEmail: By = by.name("email");
    txtPassword: By = by.id("exampleInputPassword1");
    buttSubmit: By = by.className("btn btn-success");
    successMessage: By = by.className("alert alert-success alert-dismissible");
}