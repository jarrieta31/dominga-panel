import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Artista } from '../interfaces/artista.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ArtistasService {
    private artistas$: BehaviorSubject<Artista[]>;
    private artistas: Artista[] = []; //copia activa local de todos los lugares para trabajar con ella
    private idNuevoArtista: string = '';
    private artistasRef = this.afs.collection('artistas');
    private mapCache = new Map();

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.artistas$ = new BehaviorSubject(this.artistas);
    }

    /** 
     * Obtiene todos los artistas desde firestore y los almacena en artistas[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getArtistasFirestore(dpto: string) {

        if (!this.mapCache.has(dpto)) {
            //this.afs.collection('artistas').ref.where('departamento', "==", dpto).where('fechaFin', ">=", Timestamp.fromDate(fechaActual) ).orderBy('fechaFin').get().then(
            this.artistasRef.ref.where('departamento', "==", dpto).get().then(
                querySnapshot => {
                    let arrArtista: Artista[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrArtista.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(dpto, arrArtista.slice());
                    this.artistas = arrArtista.slice();
                    //this.artistas$.next(this.artistas); //el subject lugares$ emite los lugares
                    this.getArtistasFiltrados()
                }
            ).catch(error => {
                console.error("Error en getArtistasFirestore(). error:" + error);
            });
        } else {
            let arrArtistas: Artista[] = [];
            arrArtistas = this.mapCache.get(dpto);
            this.artistas = arrArtistas.slice();
            this.getArtistasFiltrados()
            //this.artistas$.next(this.artistas)
        }

    }

    getArtistasFiltrados() {
        // Por departamento
        if (this.ls.localidad === '' && this.ls.publicado === 'todos') {
            this.artistas$.next(this.artistas)
        }
        // Departamento y Publidados
        else if (this.ls.localidad === '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.artistas$.next(this.artistas.filter(artista =>
                artista.publicado == p
            ));
        }
        // Departamento y Localidad 
        else if (this.ls.localidad !== '' && this.ls.publicado === 'todos') {
            this.artistas$.next(this.artistas.filter(artista =>
                artista.localidad === this.ls.localidad
            ));
        }
        // Departamento, Localidad y Publidados
        else if (this.ls.localidad !== '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.artistas$.next(this.artistas.filter(artista =>
                artista.localidad === this.ls.localidad && artista.publicado == p
            ));
        }
    }


    /** Obtiene el artista a partir del id que recibe y */
    getArtistaId(id: string): Observable<Artista> {
        const eventoEncontrado = this.artistas.filter(item => item.id == id);
        return from(
            eventoEncontrado
        );
    }

    /**
     * Agrega un artista en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local artistas.
     * @param artista Contiene la información del nuevo artista.
     * @returns Retorna el ID del artista obtenido de firestore
     */
    async addArtista(artista: Artista): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.artistasRef.add(artista)
            nuevoId = documentRef.id;
            artista.id = nuevoId;
            this.artistas.push(artista);
            this.mapCache.set(artista.departamento, this.artistas);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo artista. Error: " + error);
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
    updateArtistaFirestore(artista: Artista, id: string): Promise<any> {
        return this.afs.doc<Artista>(`artistas/${id}`).set(artista); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un lugar ya existente en el array local lugares.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateArtistaLocal(data: Artista) {
        let i = this.artistas.findIndex(artista => artista.id === data.id);
        this.artistas[i] = JSON.parse(JSON.stringify(data));
        this.mapCache.set(data.departamento, this.artistas);
    }

    getCache(nombreDpto: string): Artista[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject artistas$ con la lista de todos los artistas.
     * @returns {Observable}
     */
    getObsArtistas$(): Observable<Artista[]> {
        return this.artistas$.asObservable();
    }

    emitirArtistas() {
        this.artistas$.next(this.artistas);
    }

    /** Elimina correctamente el artista */
    deleteArtista(id: string) {
        let indiceEliminar = this.artistas.findIndex(item => item.id === id);
        this.artistasRef.doc(id).delete().then(res => {
            this.artistas.splice(indiceEliminar, 1);
            this.emitirArtistas();
            console.log("Artista eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el artista " + id + ". Error:" + err)
        })
    }

    /** 
     * test Ok: Filtra lugares por departamento en el array local lugares. La lista 
     * resultante es emitida desde el Subject lugares$. 
     * @param {String} departamento Nombre del departamento por el cual se realiza la busqueda.
     */
    getArtistasPorDepartamento(departamento: string): void {
        let eventosDepartamento = this.artistas.filter(artista => artista.departamento === departamento);
        this.artistas$.next(eventosDepartamento);
    }

    /** OK: Filtra por el estado de publicacion y por el departamento, luego 
     * actualiza el Subject  lugares$
      */
    getArtistasPublicadoYDepartamento(pub: boolean, depto: string): void {
        this.artistas$.next(
            this.artistas.filter(artista => {
                if (artista.publicado === pub && artista.departamento === depto) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    getArtistasPublicadoDepartamentoLocalidad(pub: boolean, dpto: string, loc: string) {
        this.artistas$.next(
            this.artistas.filter(artista => {
                if (artista.publicado === pub && artista.departamento === dpto && artista.localidad === loc) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    getArtistasLocalidad(loc: string) {
        let eventosLocalidad = this.artistas.filter(artista => artista.localidad === loc);
        this.artistas$.next(eventosLocalidad);
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
