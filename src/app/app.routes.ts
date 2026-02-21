import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PlantesList } from './plantes/plantes-list/plantes-list';
import { PlantesTable } from './plantes/plantes-table/plantes-table';
import { PlantesDetail } from './plantes/plantes-detail/plantes-detail';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { PlantesMap } from './plantes/plantes-map/plantes-map';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

    {path: 'home', component: Home},
    {path: 'plantes/:search', component: PlantesList, canActivate: [authGuard]},
    {path: 'plantes', component: PlantesList, canActivate: [authGuard]},
    {path: 'plantes_table', component: PlantesTable, canActivate: [authGuard]},
    {path: 'planta/:id', component: PlantesDetail, canActivate: [authGuard]},
    {path: 'login', component: Login},
    {path: 'register', component: Register},
    {path: 'profile', component: Profile, canActivate: [authGuard]},
    {path: 'mapa', component: PlantesMap, canActivate: [authGuard]},
    {path: '**', pathMatch: 'full', redirectTo: 'home'}

];
