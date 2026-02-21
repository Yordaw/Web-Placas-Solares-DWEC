import { Injectable, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Planta } from '../plantes/planta';
import { Registre } from '../plantes/registre';
import { SupabaseClient, createClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root',
})
export class Supaservice {
  private supabase: SupabaseClient;
  private searchString = signal('');

  constructor(){
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  // --- Search ---
  setSearchString(value: string) {
    this.searchString.set(value);
  }

  getSearchString() {
    return this.searchString;
  }

  // --- Auth ---
  authChangesObservable() {
    return new Observable<{ event: string; session: any }>(subscriber => {
      this.supabase.auth.onAuthStateChange((event, session) => {
        subscriber.next({ event, session });
      });
    });
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }


  // 1. Función que recoge datos de TODAS las plantas
  async getAllPlantes() {
    const { data, error } = await this.supabase.from('plantes').select('*');
    if (error) {
      console.error('Error fetching plantes:', error);
      throw error;
    }
    return data;
  }

  // 2. Función que recoge datos de TODOS los registros
  async getAllRegistres() {
    const { data, error } = await this.supabase.from('registres').select('*');
    if (error) {
      console.error('Error fetching registres:', error);
      throw error;
    }
    return data;
  }

  // 3. Función que recoge datos de UNA planta (por ID)
  async getPlantaById(id: number) {
    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching planta:', error);
      throw error;
    }
    return data;
  }

  // 4. Función que recoge registros de UNA planta
  async getRegistresByPlanta(plantaId: number) {
    const { data, error } = await this.supabase
      .from('registres')
      .select('*')
      .eq('planta', plantaId);
    if (error) {
      console.error('Error fetching registres by planta:', error);
      throw error;
    }
    return data;
  }


  // 5. Insertar registros de generación/consumo
  async insertRegistresSupabase(registres: Registre[]) {
    const { error } = await this.supabase.from('registres').insert(registres);
    if (error) {
      console.error('Error inserting registres:', error);
      throw error;
    }
  }

  async login(loginData: {email: string, password: string}){
    const { data, error } = await this.supabase.auth.signInWithPassword(loginData);
    if (error) {
      console.error('Error logging in:', error);
      throw error;
    }
    return data;
  }

  async register(registerData: {email: string, password: string}){
    const { data, error } = await this.supabase.auth.signUp(registerData);
    if (error) {
      console.error('Error registering:', error);
      throw error;
    }
    return data;
  }

}
