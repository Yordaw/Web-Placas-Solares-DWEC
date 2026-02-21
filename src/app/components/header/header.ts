
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '@supabase/supabase-js';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  router: Router = inject(Router);
  private supaservice: Supaservice = inject(Supaservice);
  session = signal<Session | null>(null);
  showSearch = signal(false);
  showProfileMenu = signal(false);
  uiMessage = this.supaservice.getUiMessage();

  searchString = this.supaservice.getSearchString()();

  search($event: string){
    this.searchString = $event;
    this.supaservice.setSearchString($event);
  }

  toggleSearch() {
    this.showSearch.set(!this.showSearch());
  }

  toggleProfileMenu() {
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  constructor(){
    this.supaservice.authChangesObservable().subscribe(({
      event, session }) => {
        console.log('Auth event:', event);
        console.log('Session:', session);
        this.session.set(session);
      });

    effect((onCleanup) => {
      const message = this.uiMessage();
      if (!message) {
        return;
      }

      const timeoutId = setTimeout(() => {
        this.supaservice.clearUiMessage();
      }, 5000);

      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  clearMessage() {
    this.supaservice.clearUiMessage();
  }

  async logout(){
    await this.supaservice.logout();
    await this.router.navigate(['/home']);
  }

}
