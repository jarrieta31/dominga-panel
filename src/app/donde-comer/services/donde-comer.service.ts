import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Restoran } from '../interfaces/Restoran.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DondeComerService {

    private dondeComerCollection: AngularFirestoreCollection<Restoran[]>;
    private restaurantes$: BehaviorSubject<Restoran[]>;
    private prioridades$: BehaviorSubject<number[]>;
    private restaurantes: Restoran[] = []; //copia local de todos los lugares para trabajar con ella
    private idNuevorestoran: string = '';
    private mapCache = new Map();
    departamento: string = "San José";

    constructor(
        private afs: AngularFirestore,
        private localStorageService: LocalStorageService,
    ) {
        this.restaurantes$ = new BehaviorSubject(this.restaurantes);
    }

    /** 
     * Obtiene todos los eventos desde firestore y los almacena en eventos[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getRestaurantesFirestore(departament: string) {
        //        this.afs.collection('eventos').ref.where('departamento', "==", departament).where('prioridad', ">", -1).orderBy('prioridad').get().then(
        this.afs.collection('donde_comer').ref.get().then(
            querySnapshot => {
                const arrRestaurantes: Restoran[] = [];
                querySnapshot.forEach(item => {
                    const data: any = item.data()
                    arrRestaurantes.push({ id: item.id, ...data });
                })
                this.mapCache.set(departament, arrRestaurantes.slice());
                this.restaurantes = arrRestaurantes.slice();
                //                this.updateListaPrioridadesLocal(false);//
                console.log(arrRestaurantes);
                this.restaurantes$.next(this.restaurantes); //el subject lugares$ emite los lugares
            }
        ).catch(error => {
            console.error("Error en getEventosFirestore(). error:" + error);
        });
    }


    /** Obtiene el evento a partir del id que recibe y */
    geRestoranId(id: string): Observable<Restoran> {
        const restoranEncontrado = this.restaurantes.filter(item => item.id == id);
        return from(
            restoranEncontrado
        );
    }

    /**
     * Agrega un evento en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local eventos.
     * @param evento Contiene la información del nuevo evento.
     * @returns Retorna el ID del evento obtenido de firestore
     */
    async addRestoran(restaurant: Restoran): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.afs.collection('donde_comer').add(restaurant)
            nuevoId = documentRef.id;
            this.mapCache.set(restaurant.departamento, this.restaurantes);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo restaurant. Error: " + error);
        }
        return new Promise((resolve, reject) => {
            if (nuevoId !== undefined && nuevoId.length > 0) {
                resolve(nuevoId)
            } else {
                reject("No se puedo obtener el ID")
            }
        })
    }

    /**
     * Actuliza la información de lugar en la nube de Firestore, utilizando el método destructivo "set" (borra todo lo que este y 
     * guarda solo los valores actuales).
     * @param lugar Contiene todos los datos del lugar menos el ID.
     * @returns 
     */
    updateRestoranFirestore(restaurant: Restoran, id: string): Promise<any> {
        return this.afs.doc<Restoran>(`donde-comer/${id}`).set(restaurant); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un lugar ya existente en el array local lugares.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateRestoranLocal(data: Restoran) {
        let i = this.restaurantes.findIndex(restaurant => restaurant.id === data.id);
        this.restaurantes[i] = JSON.parse(JSON.stringify(data));
        this.restaurantes$.next(this.restaurantes);
    }

    getCache(nombreDpto: string): Restoran[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject eventos$ con la lista de todos los eventos.
     * @returns {Observable}
     */
    getObsRestaurantes$(): Observable<Restoran[]> {
        return this.restaurantes$.asObservable();
    }

    emitirEventos() {
        this.restaurantes$.next(this.restaurantes);
    }

    /** Elimina correctamente el evento */
    deleteEvento(id: string) {
        let indiceEliminar = this.restaurantes.findIndex(item => item.id === id);
        this.afs.collection('eventos').doc(id).delete().then(res => {
            this.restaurantes.splice(indiceEliminar, 1);
            this.emitirEventos();
            console.log("Evento eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el evento " + id + ". Error:" + err)
        })
    }

    /**
     *  Función para generar string random, se utilizar para crear el nombre de la carpeta
     * que almacena las imagenes. Funciona como un id. 
     * @param length Es largo que queremos el string.
     * @returns Retorna un string random.
     */
    randomString(length: number): string {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }
}
