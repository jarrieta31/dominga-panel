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

    valididarNumeroWhatsapp(control: FormControl): ValidationErrors | null {
        if (control.value === "" || control.value === null) {
            return null;
        } else {
            const valor: string = control.value?.trim().toLowerCase();
            //Ejemplo: https://api.whatsapp.com/send?phone=59899468473
            let regExPersonal = /09[\d]{7}$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { whatsapp: true };
        }
    }

    validarInstagram(control: FormControl): ValidationErrors | null {
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
    validarVideoYoutube(control: FormControl): ValidationErrors | null{
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
     * Valida el link a youtube con el formato listo para embeber en al app. 
     * @param control FormControl del video
     * @returns 
     */
    validarLinkYoutube(control: FormControl): ValidationErrors | null{
        //console.log(control.value)
        // tiene que quedar:    https://www.youtube.com/embed/WEn3eSV-hvw
        console.log(control.value)
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExVideo = /^https:\/\/(?:www\.)?youtube\.com\/watch\b([-a-zA-Z0-9_=&?]{50,80})$/g;
            let regExCanal = /^https:\/\/(?:www\.)?youtube\.com\/channel\/\b([-a-zA-Z0-9_]{24})$/g;
            if (regExVideo.test(valor) || regExCanal.test(valor)) {
                return null;
            }
            return { youtube: true };
        }
    }


    /**
     * Valida el link de un video de youtube con el formato listo para embeber en al app. 
     * @param control FormControl del video
     * @returns 
     */
    validarTelefono(control: FormControl): ValidationErrors | null{
        // puede aceptar : 43422835 o 43422835-36 o 099123456   
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExLinea = /^\b([0-9]{8,8})(?:-[0-9]{2,2})?$/g;
            let regExCelular = /^\b([0-9]{9,9})$/g;
            let regExEmergencia = /^\b([0-9]{3,3})$/g;
            if (regExLinea.test(valor) || regExCelular.test(valor) || regExEmergencia.test(valor)) {
                return null;
            }
            return { telefono: true };
        }
    }

    validarTickAntel(control: FormControl): ValidationErrors | null {
        console.log(control.value)
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExPersonal = /^https:\/\/tickantel.com.uy\/\b([-a-zA-Z0-9_]{11,})$/g;
            if (regExPersonal.test(valor)) {
                return null;
            }
            return { tickAntel: true };
        }

    }

    valididarImagenCarrusel(control: FormControl): ValidationErrors | null {
        console.log(control.value.name)
        if (control.value.name !== "imagen-default" ) {
            return null;
        } else {
            return { imagen: true };
        }
    }

    /**
     * Valida el link de una playlist, o de un artista de spotify con el formato listo para pegar en al app. 
     * @param control FormControl de link spotify
     * @returns 
     */
    validarPlayListSpotify(control: FormControl): ValidationErrors | null{
        //https://open.spotify.com/playlist/00tfEBrWnJvbSA5VjsjnRA?si=86593d2769974857
        //https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d?si=bQ7EkrD9SuCeyrvfzcZizw&nd=1
        console.log(control.value)
        if ( control.value === null || control.value === '') {
            return null;
        } else {
            const valor: string = control.value;
            let regExArtist = /^https:\/\/open\.spotify\.com\/artist\/\b([-a-zA-Z0-9_?=&]{42,53})$/g;
            let regExPlayList = /^https:\/\/open\.spotify\.com\/playlist\/\b([-a-zA-Z0-9_?=]{42,53})$/g;
            if (regExArtist.test(valor) || regExPlayList.test(valor) ) {
                return null;
            }
            return { spotify: true };
        }
    }
    
    /**
     * Valida la latitud.
     * @param control FormControl latitud
     * @returns 
     */
    validarLatitud(control: FormControl): ValidationErrors | null{
        console.log(typeof control.value)
        console.log(control.value)
        if ( control.value === null ) {
            return null;
        } else {
            const valor: number = Number(control.value);
            if (  valor >= -39 && valor <= -30 ){
                return null;
            }
            return { latitud: true };
        }
    }


    /**
     * Valida la longitud.
     * @param control FormControl longitud
     * @returns 
     */
    validarLongitud(control: FormControl): ValidationErrors | null{
        if ( control.value === null ) {
            return null;
        } else {
            const valor: number = Number(control.value);
            if (  valor >= -59 && valor <= -50){
                return null;
            }
            return { longitud: true };
        }
    }
}
