import { DepartamentoEnum } from '../../lugares/interfaces/lugar.interface'

export interface Departamento {
    id?: string;
    nombre: DepartamentoEnum;
    localidades: string[];
}