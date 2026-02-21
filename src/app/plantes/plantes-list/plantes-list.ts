import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PlantesItem } from '../plantes-item/plantes-item';
import { Planta } from '../planta';
import { Supaservice } from '../../services/supaservice';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { from, Subscription } from 'rxjs';


@Component({
  selector: 'app-plantes-list',
  imports: [PlantesItem],
  templateUrl: './plantes-list.html',
  styleUrl: './plantes-list.css',
})
export class PlantesList implements OnInit,OnDestroy {
  private supaservice: Supaservice = inject(Supaservice);
  searchString = this.supaservice.getSearchString();

  //Manera tradicional (SIN SDK)
  //OnInit, OnDestroy, this.plantesSuscription = this.supaservice.getPlantes().subscribe y en el ngOnDestroy():void this.plantesSuscription && this.plantesSuscription.unsuscribe();

  //Manera más simple con signalizacion (SIN SDK) (signal). La gente que programa con Angular pidió esta manera más actual para no tener que hacer el ngOnInit todo el rato
  //plantes = toSignal(this.supaservice.getPlantes(), {initialValue: []})
  /**
   * plantes = computed (() => this.plantesResource.value() ?? []);
   * toggleFavorite(planta: Planta){
   * planta.favorite = !planta.favorite;
   * }
   */
  
  //Con SKD
  //public plantes = signal<Planta[]>([]);

  ngOnInit():void{
    //this.supaservice.getPlantesSupabase().then((p:Planta[]) => this.plantes.set(p))
  }

  ngOnDestroy(): void {
      
  }
  
  /*
  ngOnInit():void{
    this.supaservice.getPlantes().subscribe(
      (plantesSupabase: Planta[]) => {
        this.plantes.set(plantesSupabase)
      }
    )
  }
  */
  plantes= toSignal(from(this.supaservice.getPlantesByCurrentRole()), {initialValue: []});
  filteredPlantes = computed(() => {
    const term = this.searchString().trim().toLowerCase();
    if (!term) {
      return this.plantes();
    }

    return this.plantes().filter((planta: any) => {
      const latitude = planta?.ubicacio?.latitude ?? planta?.ubicacio?.coordenadas?.lat ?? '';
      const longitude = planta?.ubicacio?.longitude ?? planta?.ubicacio?.coordenadas?.lon ?? '';
      const haystack = `${planta?.nom ?? ''} ${planta?.user ?? ''} ${planta?.capacitat ?? ''} ${latitude} ${longitude} ${planta?.id ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  });
 // plantes = signal<Planta[]>(PLANTAS_DEMO);

  
  
}

