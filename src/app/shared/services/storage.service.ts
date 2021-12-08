import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private referencia: AngularFireStorageReference;

    constructor(
        private storage: AngularFireStorage) {
        //this.pageTokenExample();
        console.log(this.quitarAcentos("Acentos ortográficos ñiñod gráficas Métodos"))
    }

    /**
     * Función para subir los ficheros al Storage de Firebase.
     * @param tipo Es el tipo de elemento que se va a guardar.
     * @param directorio Es el nombre del directorio donde debe guardarse la imágen.
     * @param nombreArchivo - Nombre del archivo a subir.
     * @param datos - El es propio archivo.
     * @returns 
     */
    public subirArchivoCloudStorage(ruta: string, nombreArchivo: string, datos: any) {
        ruta = this.quitarAcentos(ruta);//
        return this.storage.upload(`/${ruta}/${nombreArchivo}`, datos);
    }

    /**
     * Obtiene una referencia al archvo en la nube de firebase storage.
     * @param directorio Es el nombre del directorio donde está guardada la imágen.
     * @param {string} nombreArchivo - Nombre del archivo al que queremos referenciar.
     * @returns - Refercia al archivo.
     */
    public referenciaCloudStorage(directorio: string, nombreArchivo: string) {
        directorio = this.quitarAcentos(directorio);
        let ruta = `${directorio}/${nombreArchivo}`;
        return this.storage.ref(ruta);
    }

    /**
     * Borra un archivo del Storage de Firebase.
     * El nombre del directorio donde se encuentra el archivo depende de la variable
     * basePath.
     * @param directorio Es el nombre del directorio donde está guardada la imágen.
     * @param {string} nombreArchivo - Nombre del archivo que queremos borrar.
     */
    public borrarArchivoStorage(directorio: string, nombreArchivo: string) {
        try {
            directorio = this.quitarAcentos(directorio);
            const storageRef = this.storage.ref(directorio);
            storageRef.child(nombreArchivo).delete();
        } catch (error) {
            console.error("Se produjó un error al intentar borrar la imágen de Firebase Storage. Error: " + error );
        }
    }


    /**
     * Función que quita acentos, espacios y mayuscúlas para guardar en firestorage.
     * @param name Nombre del directorio o del archivo a guardar.
     * @returns 
     */
    quitarAcentos(name: string): string {
        name.trim();
        name = name.toLowerCase();
        name = name.replace(/\s/g, "_");
        name = name.replace(/ñ/g, "n");
        name = name.replace(/Ñ/g, "N");
        name = name.replace(/\//g, "-");
        name = name.replace(/:/g, "");
        return name
            .normalize('NFD')
            .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1")
            .normalize();
    }


}



