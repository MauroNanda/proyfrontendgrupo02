import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../../../core/services/export.service';

@Component({
  selector: 'app-test-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-export.html',
  styleUrls: ['./test-export.scss'],
})
export class TestExport {
  // Datos mockeados de prueba para simular la lista de inscriptos
  inscriptosDummy = [
    {
      ID: '1',
      Nombre: 'Sebastian Villalba',
      Email: 'sebav@example.com',
      Rol: 'Asistente',
      Estado: 'Confirmado',
    },
    {
      ID: '2',
      Nombre: 'Micaela Gomez',
      Email: 'mica@example.com',
      Rol: 'Organizador',
      Estado: 'Confirmado',
    },
    {
      ID: '3',
      Nombre: 'Alejandro Rossi',
      Email: 'ale.rossi@example.com',
      Rol: 'Asistente',
      Estado: 'Pendiente',
    },
  ];

  constructor(private exportService: ExportService) {}

  testExcel(): void {
    this.exportService.exportarExcel(this.inscriptosDummy, 'reporte_inscriptos_test');
  }

  testPdf(): void {
    this.exportService.descargarPdf('ticket-enterprise-preview', 'ticket_confirmado_test');
  }
}
