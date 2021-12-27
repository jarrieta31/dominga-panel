import { Injectable } from '@angular/core';
import { FormControl, ValidationErrors, FormArray } from '@angular/forms';

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
            //let regExPersonal = /^https:\/\/www\.facebook\.com\/\b([-a-zA-Z0-9()@:%_\+.~#?&//=]{3,})$/g;
            let regExBajada = /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/ig
            if (regExBajada.test(valor)) {
                return null;
            }
            return { facebook: true };
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
            let regExPersonal = /^https:\/\/(?:www\.)?instagram\.com\/\b([-a-zA-Z0-9()@:%_\+.~#?&//=]{3,})$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { whatsapp: true };
        }
    }

    validarUbicacion(control: FormControl): ValidationErrors | null{
        if( control.value === null){
            return { ubicacion: true };
        }else if(control.value.lng === -56.4372197 && control.value.lat === -32.8246801 ){
            return { ubicacion: true };
        }else{

            return null;
        }
    }

    /**
     * Valida el link de un video de youtube con el formato listo para embeber en al app. 
     * @param control FormControl del video
     * @returns 
     */
    validarYoutube(control: FormControl): ValidationErrors | null{
        //console.log(control.value)
        // tiene que quedar:    https://www.youtube.com/embed/WEn3eSV-hvw
        console.log(control.value)
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExPersonal = /^https:\/\/(?:www\.)?youtube\.com\/embed\/\b([-a-zA-Z0-9_]{11,})$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { video: true };
        }
    }


    /**
     * Valida el link de un video de youtube con el formato listo para embeber en al app. 
     * @param control FormControl del video
     * @returns 
     */
    validarTelefono(control: FormControl): ValidationErrors | null{
        // puede aceptar : 43422835 o 43422835-36 o 099123456   
        console.log(control.value)
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExPersonal = /^\b([0-9]{8,8})(?:-[0-9]{2,2})?$/g;
            let regExPersonal2 = /^\b([0-9]{9,9})$/g;
            if (regExPersonal.test(valor) || regExPersonal2.test(valor)) {
                return null;
            }
            return { telefono: true };
        }
    }

}
