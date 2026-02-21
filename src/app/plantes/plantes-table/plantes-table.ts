import { Component, inject } from '@angular/core';
import { Supaservice } from '../../services/supaservice';
import { PlantesTableRow } from '../plantes-table-row/plantes-table-row';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

@Component({
  selector: 'app-plantes-table',
  imports: [PlantesTableRow],
  templateUrl: './plantes-table.html',
  styleUrl: './plantes-table.css',
})
export class PlantesTable {
  private supaservice: Supaservice = inject(Supaservice);
  plantes= toSignal(from(this.supaservice.getAllPlantes()), {initialValue: []});

}
