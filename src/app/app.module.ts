import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireAuthGuardModule } from "@angular/fire/compat/auth-guard";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

//Módulos Propios
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';

//Componentes
import { AppComponent } from './app.component';


@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        MaterialModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule.enablePersistence(),
        AngularFireStorageModule,
        AngularFireAuthModule,
        AngularFireAuthGuardModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
