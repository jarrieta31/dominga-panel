import { Departamento } from '../../lugares/interfaces/lugar.interface'

export interface Localidad {
    id?: string;
    departamento: Departamento;
    nombre: string;
}