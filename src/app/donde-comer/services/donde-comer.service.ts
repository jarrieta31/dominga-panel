import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Restoran } from '../interfaces/Restoran.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DondeComerService {

    private restaurantes$: BehaviorSubject<Restoran[]>;
    private restaurantes: Restoran[] = []; //copia local de todos los restaurantes para trabajar con ella
    private mapCache = new Map();
    departamento: string = "San José";

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.restaurantes$ = new BehaviorSubject(this.restaurantes);
    }

    /** 
     * Obtiene todos los restaurantes desde firestore y los almacena en restaurantes[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getRestaurantesFirestore(dpto: string) {
        if ( !this.mapCache.has(dpto) || this.restaurantes.length === 0 ) {
            console.log("get restaurantes "+dpto + " desde firestore")
            //        this.afs.collection('eventos').ref.where('departamento', "==", departament).where('prioridad', ">", -1).orderBy('prioridad').get().then(
            this.afs.collection('donde_comer').ref.where('departamento', "==", dpto).get().then(
                querySnapshot => {
                    const arrRestaurantes: Restoran[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrRestaurantes.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(dpto, arrRestaurantes.slice());
                    this.restaurantes = arrRestaurantes.slice();
                    this.getRestaurantesFiltrados()
                }
            ).catch(error => {
                console.error("Error en getEventosFirestore(). error:" + error);
            });
        } else {
            console.log("get restaurantes "+dpto + " desde la cache")
            this.restaurantes = this.mapCache.get(dpto);
            this.getRestaurantesFiltrados();
        }
    }

    /**
     * Función que realiza todos los filtros para restaurantes.
     * Los filtros se realizan sobre el array local de restaurantes.
     */
    getRestaurantesFiltrados() {
        // Por departamento
        if (this.ls.localidad === '' && this.ls.publicado === 'todos') {
            this.restaurantes$.next(this.restaurantes)
        }
        // Departamento y Publidados
        else if (this.ls.localidad === '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.restaurantes$.next(this.restaurantes.filter(evento =>
                evento.publicado == p
            ));
        }
        // Departamento y Localidad 
        else if (this.ls.localidad !== '' && this.ls.publicado === 'todos') {
            this.restaurantes$.next(this.restaurantes.filter(evento =>
                evento.localidad === this.ls.localidad
            ));
        }
        // Departamento, Localidad y Publidados
        else if (this.ls.localidad !== '' && this.ls.activos === 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.restaurantes$.next(this.restaurantes.filter(evento =>
                evento.localidad === this.ls.localidad && evento.publicado == p
            ));
        }
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
            restaurant.id = nuevoId;
            this.restaurantes.push(restaurant);
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
        return this.afs.doc<Restoran>(`donde_comer/${id}`).set(restaurant); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un restuarente ya existente en el array local restaurantes.
     * Y actualiza la cache de restaurantes.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateRestoranLocal(data: Restoran) {
        console.log("ID: "+data.id)
        let i = this.restaurantes.findIndex(restaurant => restaurant.id === data.id);
        this.restaurantes[i] = JSON.parse(JSON.stringify(data));
        this.mapCache.set(data.departamento, this.restaurantes);
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
    deleteRestoran(id: string) {
        let indiceEliminar = this.restaurantes.findIndex(item => item.id === id);
        this.afs.collection('donde_comer').doc(id).delete().then(res => {
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
