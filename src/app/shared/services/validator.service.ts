import { Injectable } from '@angular/core';
import { FormControl, ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidatorService {

    /** esta validando https://www.google.com.uy y http://google.com.uy */
    webPattern: string = "^(https?:\/\/)(?:www\.)?([a-z-0-9_]{2,})+(\.[a-z-0-9]{2,})+(\.[a-z]{2,6})?(:[0-9]{2,5})?";
    //copiada de la web
    //webPattern: string = "^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$";
    instagramPattern: string = "";

    constructor() { }


    validarWeb(control: FormControl): ValidationErrors | null {
        //console.log(control.value)
        if (control.value === "" || control.value === null) {
            return null;
        } else {
            const valor: string = control.value?.trim().toLowerCase();
            //               (https|http):// www.      google              .com                  .{es,uy}        :4200
            let regExPersonal = /^https?:\/\/(?:www\.[\w]{2,63}\.[a-z]{2,3}|[\w]{3,63}\.[a-z]{2,3}){1}(?:\.[a-z]{2}){0,1}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { web: true };
        }
    }

    //Falta crear la expresion regular
    validarFacebook(control: FormControl): ValidationErrors | null {

        //console.log(control.value)
        if (control.value === "" || control.value === null) {
            return null;
        } else {
            const valor: string = control.value?.trim().toLowerCase();
            //Ejemplo: https://www.facebook.com/museodepartamentaldesanjose/
            let regExPersonal = /^https:\/\/www\.facebook\.com\/\b([-a-zA-Z0-9()@:%_\+.~#?&//=]{3,})$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { whatsapp: true };
        }
    }

    //revisar
    valididarWhatsapp(control: FormControl): ValidationErrors | null {

        //console.log(control.value)
        if (control.value === "" || control.value === null) {
            return null;
        } else {
            const valor: string = control.value?.trim().toLowerCase();
            //Ejemplo: https://api.whatsapp.com/send?phone=59899468473
            let regExPersonal = /^https:\/\/api\.whatsapp.com\/send\?phone\=[\d]{11}$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { whatsapp: true };
        }
    }

    validarInstagram(control: FormControl): ValidationErrors | null {
        //console.log(control.value)
        if (control.value === "" || control.value === null) {
            return null;
        } else {
            const valor: string = control.value?.trim().toLowerCase();
            //Ejemplo: https://www.facebook.com/museodepartamentaldesanjose/
            let regExPersonal = /^https:\/\/www\.instagram\.com\/\b([-a-zA-Z0-9()@:%_\+.~#?&//=]{3,})$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { whatsapp: true };
        }
    }

}
