export interface DatosMapa{
   centro: Posicion;
   zoom: number; 
   marcador?: boolean;
}

export interface Posicion{
    lng: number;
    lat: number;
}