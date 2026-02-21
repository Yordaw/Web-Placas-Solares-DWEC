import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PlantesList } from './plantes/plantes-list/plantes-list';
import { PlantesTable } from './plantes/plantes-table/plantes-table';
import { PlantesDetail } from './plantes/plantes-detail/plantes-detail';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

export const routes: Routes = [

    {path: 'home', component: Home},
    {path: 'plantes/:search', component: PlantesList},
    {path: 'plantes', component: PlantesList},
    {path: 'plantes_table', component: PlantesTable},
    {path: 'planta/:id', component: PlantesDetail},
    {path: 'login', component: Login},
    {path: 'register', component: Register},
    {path: '**', pathMatch: 'full', redirectTo: 'home'}

];
