import { Imagen } from '../../shared/interfaces/imagen.interface';


export interface Slider{
    id?: string;
    link?: string;
    linkTipo?: string;
    imagen: Imagen
    pantalla: string;
    publicado: boolean;
    departamento?: string;
}
