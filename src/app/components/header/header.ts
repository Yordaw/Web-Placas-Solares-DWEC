
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '@supabase/supabase-js';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  router: Router = inject(Router);
  private supaservice: Supaservice = inject(Supaservice);
  session = signal<Session | null>(null);

  searchString = "";

  search($event: string){
    this.supaservice.setSearchString($event);
  }

  setSearch($event:Event){
    this.router.navigate(["/plantes", this.searchString])
  }

  constructor(){
    this.supaservice.authChangesObservable().subscribe(({
      event, session }) => {
        console.log('Auth event:', event);
        console.log('Session:', session);
        this.session.set(session);
      });
  }

  logout(){
    this.supaservice.logout();
  }

}
