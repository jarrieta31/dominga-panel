import { Imagen } from '../../shared/interfaces/imagen.interface';
export interface Artista{
    id?: string;
    categoria: string;
    departamento: string;
    localidad: string;
    nombre: string;
    youtube: string;
    spotify: string;
    instagram: string;
    imagen: Imagen;
    publicado: boolean;
    carpeta: string;
}
