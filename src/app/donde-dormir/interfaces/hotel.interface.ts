
import { Imagen } from '../../shared/interfaces/imagen.interface';
import { Telefono } from '../../shared/interfaces/telefono.interface';
import { Posicion } from '../../shared/interfaces/datosMapa.interface';

export interface Hotel {
    id?: string;
    nombre: string;
    carpeta: string;
    departamento: string;
    localidad: string;
    direccion: string;
    telefonos: Telefono[];
    imagen: Imagen;
    publicado: boolean;
    ubicacion: Posicion;
}