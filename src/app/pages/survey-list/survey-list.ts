import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './survey-list.html',
  styleUrl: './survey-list.css',
})
export class SurveyList implements OnInit {

  private readonly baseUrl = environment.API_URL;

  // 👉 ESTA es la variable que usa el HTML
  responses: any[] = [];
  channelMap: Record<string, string> = {
  '1': 'Mensaje recordatorio',
  '2': 'Publicidad',
  '3': 'Aliado o convenio',
  '4': 'Redes sociales'
};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getSurvey();
  }

  getChannelText(value: string): string {
    return this.channelMap[value] ?? '—';
  }
  getSurvey(): void {
    debugger;
    this.http
      .get<any[]>(`${this.baseUrl}/Manychat/GetSurveyUser`)
      .subscribe({
        next: res => {
          this.responses = res;
        },
        error: err => {
          console.error('Error cargando encuestas', err);
        }
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
