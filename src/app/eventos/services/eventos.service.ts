import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Evento } from '../interfaces/evento.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventosService {
    private eventosCollection: AngularFirestoreCollection<Evento[]>;
    private eventos$: BehaviorSubject<Evento[]>;
    private prioridades$: BehaviorSubject<number[]>;
    private eventos: Evento[] = []; //copia local de todos los lugares para trabajar con ella
    private idNuevoEvento: string = '';
    private mapCache = new Map();
    departamento: string = "San José";

    constructor(
        private afs: AngularFirestore,
        private localStorageService: LocalStorageService,
    ) {
        this.eventos$ = new BehaviorSubject(this.eventos);
        this.prioridades$ = new BehaviorSubject([]);
    }

    /** 
     * Obtiene todos los eventos desde firestore y los almacena en eventos[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getEventosFirestore(departament: string) {
        //        this.afs.collection('eventos').ref.where('departamento', "==", departament).where('prioridad', ">", -1).orderBy('prioridad').get().then(
        this.afs.collection('eventos').ref.get().then(
            querySnapshot => {
                const arrEventos: Evento[] = [];
                querySnapshot.forEach(item => {
                    const data: any = item.data()
                    arrEventos.push({ id: item.id, ...data });
                })
                this.mapCache.set(departament, arrEventos.slice());
                this.eventos = arrEventos.slice();
                //                this.updateListaPrioridadesLocal(false);//
                console.log(arrEventos);
                this.eventos$.next(this.eventos); //el subject lugares$ emite los lugares
            }
        ).catch(error => {
            console.error("Error en getEventosFirestore(). error:" + error);
        });
    }


    /** Obtiene el evento a partir del id que recibe y */
    getEventoId(id: string): Observable<Evento> {
        const eventoEncontrado = this.eventos.filter(item => item.id == id);
        return from(
            //this.afs.doc(`lugares/${id}`).snapshotChanges() //funciona ok no se usa
            //this.afs.doc(id).get()                          //funciona ok no se usa
            eventoEncontrado
        );
    }

    /**
     * Agrega un evento en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local eventos.
     * @param evento Contiene la información del nuevo evento.
     * @returns Retorna el ID del evento obtenido de firestore
     */
    async addLugar(evento: Evento): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.afs.collection('eventos').add(evento)
            nuevoId = documentRef.id;
            this.mapCache.set(evento.departamento, this.eventos);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo evento. Error: " + error);
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
    updateEventoFirestore(evento: Evento, id: string): Promise<any> {
        return this.afs.doc<Evento>(`eventos/${id}`).set(evento); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un lugar ya existente en el array local lugares.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateEventoLocal(data: Evento) {
        let i = this.eventos.findIndex(evento => evento.id === data.id);
        this.eventos[i] = JSON.parse(JSON.stringify(data));
        this.eventos$.next(this.eventos);
    }

    getCache(nombreDpto: string): Evento[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject eventos$ con la lista de todos los eventos.
     * @returns {Observable}
     */
    getObsEventos$(): Observable<Evento[]> {
        return this.eventos$.asObservable();
    }

    emitirEventos() {
        this.eventos$.next(this.eventos);
    }

    /** Elimina correctamente el evento */
    deleteEvento(id: string) {
        let indiceEliminar = this.eventos.findIndex(item => item.id === id);
        this.afs.collection('eventos').doc(id).delete().then(res => {
            this.eventos.splice(indiceEliminar, 1);
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
