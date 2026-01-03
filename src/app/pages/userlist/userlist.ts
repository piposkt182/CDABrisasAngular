import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersModificationResultDto } from '../../dto/UsersModificationResultDto';
import { environment } from './../../../environments/environment'
import { FormsModule } from '@angular/forms';

import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Agreement } from '../../dto/Agreement';

@Component({
  selector: 'app-userlist',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './userlist.html',
  styleUrl: './userlist.css'
})
export class Userlist implements OnInit {

  private readonly baseUrl = environment.API_URL;
  userList: any[] = [];
  uploadStatus: 'idle' | 'loading' | 'success' | 'warning'| 'error' = 'idle';
  activeTab: 'idle' | 'pending' | 'review' | 'paid'| 'rejected' |'error' = 'idle';
  uploadMessage = '';
  activeFilters = {
    pending: false,
    review: false,
    paid: false,
    rejected:false
  };
agreementsList: Agreement[] = [];
selectedAgreementIds: number[] = [];

  statusCtrl = new FormControl<number[]>([]);
statusSearchCtrl = new FormControl('');

agreementCtrl = new FormControl<number[]>([]);
agreementSearchCtrl = new FormControl('');

filteredAgreements: Agreement[] = [];

statuses = [
  { id: 1, name: 'Pendiente' },
  { id: 3, name: 'En revisión' },
  { id: 2, name: 'Pagado' },
  { id: 4, name: 'Rechazado' }
];

filteredStatuses = [...this.statuses];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  this.getUsers();
  this.getAgreements();

  // 🔍 buscador agreements
  this.agreementSearchCtrl.valueChanges.subscribe(value => {
    const filter = (value || '').toLowerCase();
    this.filteredAgreements = this.agreementsList.filter(a =>
      a.name.toLowerCase().includes(filter)
    );
  });

  // 🔗 conectar dropdown agreements con filtro
  this.agreementCtrl.valueChanges.subscribe(values => {
    this.selectedAgreementIds = values ?? [];
  });
}

onAgreementSelectOpened(opened: boolean) {
  if (!opened) {
    this.agreementSearchCtrl.setValue('');
  }
}

 getAgreements(): void {
  this.http
    .get<Agreement[]>(`${this.baseUrl}/Agreement/GetAllAgreements`)
    .subscribe({
      next: (res) => {
        this.agreementsList = res;
        this.filteredAgreements = [...res];
      },
      error: (err) => {
        console.error('Error cargando agreements', err);
      }
    });
}


  syncDropdownToFilters(selectedIds: number[]) {
  this.activeFilters.pending   = selectedIds.includes(1);
  this.activeFilters.review    = selectedIds.includes(3);
  this.activeFilters.paid      = selectedIds.includes(2);
  this.activeFilters.rejected  = selectedIds.includes(4);
}

toggleFilters(filter: 'pending' | 'review' | 'paid' | 'rejected') {
  this.activeFilters[filter] = !this.activeFilters[filter];

  const map: any = {
    pending: 1,
    review: 3,
    paid: 2,
    rejected: 4
  };

  const selected = Object.entries(this.activeFilters)
    .filter(([_, active]) => active)
    .map(([key]) => map[key]);

  this.statusCtrl.setValue(selected, { emitEvent: false });
}

onSelectOpened(opened: boolean) {
  if (!opened) {
    this.statusSearchCtrl.setValue('');
  }
}



trackByMessageId(index: number, msg: any) {
  return msg.id;
}

trackByUserId(index: number, user: any) {
  return user.id;
}

 toggleFilter(filter: 'pending' | 'review' | 'paid' | 'rejected') {
  this.activeFilters[filter] = !this.activeFilters[filter];
  console.log(this.activeFilters);
}

get filteredUsers() {
  const selectedStatuses: number[] = [];

  if (this.activeFilters.pending) selectedStatuses.push(1);
  if (this.activeFilters.review) selectedStatuses.push(3);
  if (this.activeFilters.paid) selectedStatuses.push(2);
  if (this.activeFilters.rejected) selectedStatuses.push(4);

  const hasStatusFilter = selectedStatuses.length > 0;
  const hasAgreementFilter = this.selectedAgreementIds.length > 0;

  return this.userList
    .map(user => {
      const filteredMessages = (user.messages ?? []).filter((msg: any) => {

        if (!msg) return false;

        // 1️⃣ filtro por estado
        const statusMatch =
          !hasStatusFilter ||
          (typeof msg.paymentStatusId === 'number' &&
           selectedStatuses.includes(msg.paymentStatusId));

        // 2️⃣ filtro por agreement
        const agreementMatch =
          !hasAgreementFilter ||
          this.selectedAgreementIds.includes(msg.agreementId);

        return statusMatch && agreementMatch;
      });

      return {
        ...user,
        messages: filteredMessages
      };
    })
    .filter(user => user.messages.length > 0);
}


  getUsers(): void {
    this.http
      .get<UsersModificationResultDto>(`${this.baseUrl}/User/GetAllUsersWithMessages`)
      .subscribe(res => {
        this.userList = res.users;
      });
  }

  uploadAgreementExcel(file: File): Observable<UsersModificationResultDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UsersModificationResultDto>(
      `${this.baseUrl}/ExcelFile/UploadExcelAgreement`,
      formData
    );
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }

  onExcelSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // 🔔 MOSTRAR TOAST (LOADING)
  this.uploadStatus = 'loading';
  this.uploadMessage = 'Subiendo archivo...';

  this.uploadAgreementExcel(file).subscribe({
    next: (res) => {
      this.userList = res.users;
      if(res.hasChanges){
        // 🔔 SUCCESS
        this.uploadStatus = 'success';
        this.uploadMessage = 'Archivo cargado correctamente';
      }else{
        this.uploadStatus = 'warning';
        this.uploadMessage = 'Archivo cargado pero no se modificaron registros';
      }
      
      // ⏱ dejar visible el toast
      setTimeout(() => {
        this.uploadStatus = 'idle';
        this.uploadMessage = '';
      }, 5000);
    },
    error: (err) => {
      console.error(err);

      // 🔔 ERROR
      this.uploadStatus = 'error';
      this.uploadMessage = 'Error al subir el archivo';

      setTimeout(() => {
        this.uploadStatus = 'idle';
        this.uploadMessage = '';
      }, 5000);
    }
  });
  input.value = '';
}

get hasSelectedMessages(): boolean {
  return this.userList?.some(user =>
    user.messages?.some((msg: any) => msg.selected)
  ) ?? false;
}

markSelectedAsPaid(): void {
  const selectedIds = this.userList
    .flatMap(user => user.messages ?? [])
    .filter(msg => msg.selected)
    .map(msg => msg.id);

  console.log('IDs seleccionados:', selectedIds);
  if (selectedIds.length === 0) return;
  this.markMessagesAsPaid(selectedIds);
}

markMessagesAsPaid(messageIds: number[]): void {
  this.http
    .post(`${this.baseUrl}/Message/PaidAgreements`, messageIds)
    .subscribe({
      next: () => {
        console.log('Mensajes marcados como pagados');
        this.clearSelections();
        this.getUsers();
      },
      error: (err) => {
        console.error('Error marcando mensajes', err);
      }
    });
}

clearSelections(): void {
  for (const user of this.userList) {
    for (const msg of user.messages ?? []) {
      msg.selected = false;
    }
  }
}

syncData() {
  debugger;
  this.getUsers();
}



}
