import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Planta } from '../planta';

@Component({
  selector: '[app-plantes-item]',
  imports: [RouterLink],
  templateUrl: './plantes-item.html',
  styleUrl: './plantes-item.css',
})
export class PlantesItem {
  planta = input.required<Planta>({alias: 'plantaId'});

  getLatitude(): number | string {
    const ubicacio: any = this.planta()?.ubicacio as any;
    return ubicacio?.latitude ?? ubicacio?.coordenadas?.lat ?? '-';
  }

  getLongitude(): number | string {
    const ubicacio: any = this.planta()?.ubicacio as any;
    return ubicacio?.longitude ?? ubicacio?.coordenadas?.lon ?? '-';
  }
}
