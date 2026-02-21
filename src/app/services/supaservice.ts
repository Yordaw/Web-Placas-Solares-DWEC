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
  private plantesImagesBucket = 'plantes-images';
  private searchString = signal('');
  private uiMessage = signal('');
  plantesSignal = signal<Planta[]>([]);

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

  setUiMessage(value: string) {
    this.uiMessage.set(value);
  }

  getUiMessage() {
    return this.uiMessage;
  }

  clearUiMessage() {
    this.uiMessage.set('');
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

  async getMyPlantes() {
    const user = await this.getCurrentUser();
    if (!user) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .eq('user', user.id);

    if (error) {
      console.error('Error fetching user plantes:', error);
      throw error;
    }

    return data;
  }

  async getPlantesByCurrentRole() {
    const user = await this.getCurrentUser();
    if (!user) {
      return [];
    }

    const profile = await this.getProfilePlacas(user.id);
    if (profile?.role === 'admin') {
      return this.getAllPlantes();
    }

    return this.getMyPlantes();
  }

  async loadPlantesSignal() {
    const data = await this.getPlantesByCurrentRole();
    this.plantesSignal.set((data ?? []) as Planta[]);
  }

  async loadAllPlantesSignal() {
    const data = await this.getAllPlantes();
    this.plantesSignal.set((data ?? []) as Planta[]);
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

  async createPlanta(planta: {
    nom: string;
    capacitat: number;
    foto?: string | null;
    latitude: number;
    longitude: number;
  }) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('No hay sesion activa');
    }

    const payload = {
      nom: planta.nom,
      capacitat: planta.capacitat,
      foto: planta.foto ?? null,
      user: user.id,
      ubicacio: {
        latitude: planta.latitude,
        longitude: planta.longitude,
      },
    };

    const { data, error } = await this.supabase
      .from('plantes')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating planta:', error);
      throw error;
    }

    return data;
  }

  async updatePlanta(
    id: number,
    planta: {
      nom: string;
      capacitat: number;
      foto?: string | null;
      latitude: number;
      longitude: number;
    }
  ) {
    const payload = {
      nom: planta.nom,
      capacitat: planta.capacitat,
      foto: planta.foto ?? null,
      ubicacio: {
        latitude: planta.latitude,
        longitude: planta.longitude,
      },
    };

    const { data, error } = await this.supabase
      .from('plantes')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating planta:', error);
      throw error;
    }

    return data;
  }

  async deletePlanta(id: number) {
    const { error } = await this.supabase
      .from('plantes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting planta:', error);
      throw error;
    }
  }

  async uploadPlantaImage(file: File, userId: string) {
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.plantesImagesBucket)
      .upload(fileName, file, { upsert: false });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data } = this.supabase.storage
      .from(this.plantesImagesBucket)
      .getPublicUrl(fileName);

    return {
      path: fileName,
      publicUrl: data.publicUrl,
    };
  }

  async downloadFile(path: string) {
    const { data, error } = await this.supabase.storage
      .from(this.plantesImagesBucket)
      .download(path);

    if (error) {
      console.error('Error downloading file:', error);
      throw error;
    }

    return data;
  }

  readFileAsUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
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

  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
    return data.user;
  }

  async getProfilePlacas(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles_placas')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  }

  async upsertProfilePlacas(profile: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    website?: string | null;
  }) {
    const { data, error } = await this.supabase
      .from('profiles_placas')
      .upsert(profile, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }

    return data;
  }

}
