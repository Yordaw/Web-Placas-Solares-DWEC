import { AfterViewInit, Component, effect, inject, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-plantes-map',
  imports: [],
  templateUrl: './plantes-map.html',
  styleUrl: './plantes-map.css',
})
export class PlantesMap implements OnInit, AfterViewInit {
  private supaservice: Supaservice = inject(Supaservice);

  plantes = this.supaservice.plantesSignal;
  searchString = this.supaservice.getSearchString();

  private map!: L.Map;
  private myIcon!: L.Icon;
  private markersLayer = L.layerGroup();
  private mapReady = false;

  constructor() {
    effect(() => {
      const term = this.searchString().trim().toLowerCase();
      const plantes = this.plantes().filter((planta: any) => {
        if (!term) {
          return true;
        }
        const latitude = planta?.ubicacio?.latitude ?? planta?.ubicacio?.coordenadas?.lat ?? '';
        const longitude = planta?.ubicacio?.longitude ?? planta?.ubicacio?.coordenadas?.lon ?? '';
        const haystack = `${planta?.nom ?? ''} ${planta?.user ?? ''} ${planta?.capacitat ?? ''} ${latitude} ${longitude} ${planta?.id ?? ''}`.toLowerCase();
        return haystack.includes(term);
      });
      if (!this.mapReady) {
        return;
      }

      this.markersLayer.clearLayers();
      plantes.forEach((planta: any) => {
        const latitude = planta?.ubicacio?.latitude ?? planta?.ubicacio?.coordenadas?.lat;
        const longitude = planta?.ubicacio?.longitude ?? planta?.ubicacio?.coordenadas?.lon;

        if (latitude != null && longitude != null) {
          const marker = L.marker([Number(latitude), Number(longitude)], {
            icon: this.myIcon,
          }).addTo(this.markersLayer);

          marker.bindPopup(`<b>${planta.nom ?? 'Planta'}</b><br>Capacidad: ${planta.capacitat ?? 'N/A'} MW`);
        }
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.supaservice.loadAllPlantesSignal();
  }

  ngAfterViewInit(): void {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map').setView([40, -3.5], 6);
    L.tileLayer(baseMapURl).addTo(this.map);

    this.myIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.markersLayer.addTo(this.map);
    this.mapReady = true;

    const plantes = this.plantes();
    if (plantes.length > 0) {
      plantes.forEach((planta: any) => {
        const latitude = planta?.ubicacio?.latitude ?? planta?.ubicacio?.coordenadas?.lat;
        const longitude = planta?.ubicacio?.longitude ?? planta?.ubicacio?.coordenadas?.lon;

        if (latitude != null && longitude != null) {
          const marker = L.marker([Number(latitude), Number(longitude)], {
            icon: this.myIcon,
          }).addTo(this.markersLayer);

          marker.bindPopup(`<b>${planta.nom ?? 'Planta'}</b><br>Capacidad: ${planta.capacitat ?? 'N/A'} MW`);
        }
      });
    }
  }
}
