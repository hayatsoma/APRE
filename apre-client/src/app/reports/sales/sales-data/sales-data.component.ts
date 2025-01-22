import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
@Component({
  selector: 'app-sales-data',
  standalone: true,
  imports: [TableComponent ],
  template: `
    <h1>Sales Data</h1>
    <div class= "sales-data-container">
      @if (errorMessage){
        <div class="message message-error">{{errorMessage}}</div>
      }
      <div class="card table-card">
        <!-- get the table component from region-tabular-->
        <app-table
            [title]="'Sales Data - Tabular View'"
            [data]="SalesData"
            [recordsPerPage]= "50"
            [headers]="['region', 'product', 'channel', 'amount']"
            [sortableColumns]="['region', 'product', 'channel', 'amount']"
          >
        </app-table>
      </div>
    </div>
  `,
  styles: `
  .sales-data-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .table-card{
    width: 50%;
    margin: 20px 0;
    padding: 10px;
  }

  app-table {
    padding: 50px;
  }
  `
})
export class SalesDataComponent {
  SalesData: any[] = [];
  errorMessage:string;



  constructor ( private http: HttpClient){
    this.errorMessage = '';

    this.http.get(`${environment.apiBaseUrl}/reports/sales/sales-data`).subscribe({
      next: (data: any) => {
        this.SalesData = data;
        this.errorMessage = '';
        console.log(this.SalesData)
      },
      error: (err) => {
        this.errorMessage ='Error fetching data from the server.';
        console.error('Error fetching sales data', err);
      }
    });
  }

}
