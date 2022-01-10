import { Imagen } from '../../shared/interfaces/imagen.interface';
export interface Restoran {
    id?: string;
    nombre: string;
    departamento: string;
    localidad: string;
    direccion: string;
    telefono: string;
    imagen: Imagen;
    publicado: boolean;
}