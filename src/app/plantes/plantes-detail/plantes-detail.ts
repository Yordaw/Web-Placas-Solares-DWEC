import { Component, computed, DestroyRef, effect, ElementRef, inject, resource, Signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';
import { Planta } from '../planta';
import { DatePipe } from '@angular/common';
import { Supaservice } from '../../services/supaservice';
import { RegisterService } from '../../services/register-service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Registre {
  created_at: string;
  planta: number;
  hour?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-plantes-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './plantes-detail.html',
  styleUrl: './plantes-detail.css',
})
export class PlantesDetail {
  private route = inject(ActivatedRoute);
  private supaservice = inject(Supaservice);
  registerService = inject(RegisterService);

  private id = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id'))))
  );

  canvas = viewChild<ElementRef>('chart');
  chart?: Chart;

  plantaResource = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.supaservice.getPlantaById(Number(params.id))
  });

  planta = computed(() => {
    return this.plantaResource.hasValue() ? this.plantaResource.value() : null;
  });

  registrosResource = resource({
    params: () => ({ plantaId: this.id(), live: this.registerService.isRunning() }),
    loader: ({ params }) => {
      if (!params.live) return Promise.resolve([]);
      return this.supaservice.getRegistresByPlanta(Number(params.plantaId));
    }
  });

  registros: Signal<Registre[]> = computed(() => {
    return this.registrosResource.hasValue() ? this.registrosResource.value().map((r: any) => {
      const date = new Date(r.created_at ? r.created_at : '');
      r.hour = date.getHours().toString().padStart(2, '0')
        + ':' + date.getMinutes().toString().padStart(2, '0')
        + ':' + date.getSeconds().toString().padStart(2, '0');
      return r;
    }) : [];
  });

  private destroyRef = inject(DestroyRef);
  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor() {
    // Recargar registros mientras está en modo "vivo"
    effect(() => {
      if (this.registerService.isRunning()) {
        this.refreshInterval = setInterval(() => {
          this.registrosResource.reload();
        }, 500);
      } else {
        clearInterval(this.refreshInterval);
      }
    });

    this.destroyRef.onDestroy(() => {
      clearInterval(this.refreshInterval);
      this.registerService.stopRegistration();
    });

    effect(() => {
      this.chart?.destroy();

      if (this.canvas()?.nativeElement) {
        this.chart = new Chart(this.canvas()!.nativeElement, {
          type: 'line',
          data: {
            labels: [],
            datasets: []
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              x: {
                title: { display: true, text: 'Hora' },
                grid: { display: true },
              },
              y: {
                title: { display: true, text: 'MW' },
                grid: { display: true },
                beginAtZero: true,
              }
            },
            plugins: {
              legend: { display: true },
            }
          }
        });
      }
    });

    effect(() => {
      const regs = this.registros();
      if (this.chart && regs.length > 0) {
        const keys = Object.keys(regs[0]).filter(
          k => !['created_at', 'planta_id', 'planta', 'hour', 'id'].includes(k) && typeof regs[0][k] === 'number'
        );

        this.chart.data = {
          labels: regs.map(row => row.hour),
          datasets: keys.map((key, i) => ({
            label: key,
            data: regs.map(row => row[key]),
            borderColor: `hsl(${i * 60}, 70%, 50%)`,
            fill: false,
          }))
        };
        this.chart.update();
      }
    });
  }
}
