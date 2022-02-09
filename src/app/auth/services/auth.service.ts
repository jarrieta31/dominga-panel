import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private user: Observable<firebase.User | null>;

    constructor(private afAuth: AngularFireAuth, private router: Router) {
        // authState es la instancia de autentificación actual
        this.user = this.afAuth.authState;
    }

    isLoggedIn() {
        return this.afAuth.authState.pipe(first())
    }

    // Registro con email
    signUpWithEmail(email: string, pass: string): any {
        try {
            const res = this.afAuth.createUserWithEmailAndPassword(email, pass)
            console.log('Registro correcto!')
            return res
        } catch (error) {
            console.log('Error en registro con email: ', error.message);
        }
    }

    // Ingreso con email
    signInWithEmail(email: string, pass: string):any {
        try {
            return this.afAuth.signInWithEmailAndPassword(email, pass)
        } catch (error) {
            console.log('Error en ingreso con email: ', error)
        }
    }

    // Obtener el observador del usuario actual
    get currentUser(): Observable<firebase.User>{
        return this.user;
    }

    // Finalizar sesión
    signOut() {
        this.afAuth.signOut().then((res) => {
            console.log('saliste', res);
            this.router.navigateByUrl('/auth/login');
        }).catch((res) => {
            console.log('error en signOut');
        })
    }

    // Recuperar contraseña
    resetPassword(email: string): any {
        try {
            return this.afAuth.sendPasswordResetEmail(email);
        } catch (error) {
            console.log('Error al recuperar contraseña: ', error);
        }
    }

}
