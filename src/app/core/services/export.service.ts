import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  /**
   * Exporta un arreglo de objetos JSON directamente a un archivo Excel (.xlsx)
   */
  exportarExcel(datos: any[], filename: string): void {
    if (!datos || datos.length === 0) {
      console.warn('No hay datos para exportar a Excel');
      return;
    }

    // 1. Crear la hoja de trabajo (Worksheet) a partir del JSON
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);

    // 2. Crear el libro de trabajo (Workbook)
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscriptos');

    // 3. Generar el archivo y forzar la descarga
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Captura un contenedor HTML por su ID, lo convierte en imagen y genera un PDF estructurado
   */
  async descargarPdf(elementoHtmlId: string, filename: string): Promise<void> {
    const elemento = document.getElementById(elementoHtmlId);
    if (!elemento) {
      console.error(`No se encontró ningún elemento HTML con el ID: ${elementoHtmlId}`);
      return;
    }

    try {
      // Tip de integración de la consigna: scale: 2 para que los QR no salgan borrosos
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true, // Permite cargar imágenes/QR de servidores externos si los hubiera
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Configuración del PDF en formato A4 (retrate)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho de un A4 en mm
      const pageHeight = 295; // Alto de un A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Renderizar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si el diseño enterprise ocupa más de una página, hacemos un loop recursivo
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF con html2canvas/jspdf:', error);
    }
  }
}
