import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup = this.fb.group({
        email: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(60)]],
        password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    })

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) { }

    ngOnInit(): void {
    }

    //Funcion que llama al método onLogin del servicio
    async onLogin(email: string, password: string) {
        email = email.trim();
        password = password.trim();
        try {
            this.presentLoginLoading();
            const user = await this.authService.signInWithEmail(email, password);
            
            if (user) {
                this.router.navigateByUrl('/lugares/listado');
            }
        } catch (error) {
            var message;
            var code = error.code
            switch (error.code) {
                case "auth/network-request-failed":
                    message = "No se pudo establecer la conxión a internet.";
                    break;
                case "auth/invalid-email":
                    message = "La dirección de correo electrónico no es válida."
                    break;
                case "auth/user-disabled":
                    message = "El usuario dado ha sido deshabilitado."
                    break;
                default:
                    message = "Su inicio de sesión no tuvo éxito!!. Verifique los datos ingresados.";
                    break;
            }
            let title = "Mensaje inicio de sesión";
            console.log(title+": " +message);
        }
    }

    onResetForm() {
        this.loginForm.reset();
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.onLogin(this.email.value, this.password.value);
            this.onResetForm();
            // console.log("Form Login corrento:", this.loginForm.value.email);
        } else {
            // console.log("Formulario no valido");
        }
    }


    async resetPasswordAlertPrompt() {
    }

    async presentLoginLoading() {
    //    const loading = await this.loadingController.create({
    //        cssClass: 'my-custom-class',
    //        message: 'Enviando ...',
    //        duration: 1000
    //    });
    //    await loading.present();

    //    const { role, data } = await loading.onDidDismiss();
    //    console.log('Loading dismissed!');
    }



    get email() { return this.loginForm.get('email') }
    get password() { return this.loginForm.get('password') }

}
