import { maneuverModifier } from './../models/constans/maneuver-modifier.constant';
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { RouteLeg, RouteStep, StepManeuver } from 'osrm';
import { font, maneuverType } from '../models/constans';

/**
 * Сервис для работы с PDF
 * @export
 * @class PdfService
 */
@Injectable()
export class PdfService {
  /**
   * Документ
   * @private
   * @type {jsPDF}
   * @memberof PdfService
   */
  private document: jsPDF;
  
  /**
   * Текущий отступ по оси Y
   * @private
   * @type {number}
   * @memberof PdfService
   */
  private currentYOffset: number = 0;
  /**
   * Отсуп
   * @private
   * @type {number}
   * @memberof PdfService
   */
  private gap: number = 5;
  /**
   * Ширина страницы
   * @private
   * @type {number}
   * @memberof PdfService
   */
  private pageWidth: number = 210;
  /**
   * Высота страницы
   * @private
   * @type {number}
   * @memberof PdfService
   */
  private pageHeight: number = 297;
  /**
   * Ширина шага
   * http://project-osrm.org/docs/v5.5.1/api/#routestep-object
   * @private
   * @type {number}
   * @memberof PdfService
   */
  private stepWidth: number = this.pageWidth - 10 * 2;

  /**
   * Добавление шрифта (поддерживающего UTF-8)
   * @private
   * @memberof PdfService
   */
  private addFont(): void {
    this.document.addFileToVFS('Tektur.ttf', font);
    this.document.addFont('Tektur.ttf', 'Tektur', 'normal');
    this.document.setFont('Tektur');
  }

  /**
   * Инициализация документа
   * @private
   * @memberof PdfService
   */
  private initDocument(): void {
    this.document = new jsPDF();
    this.addFont();
  }

  /**
   * Добавление заголовка
   * @private
   * @param {string} text текст
   * @param {number} x координата по оси X
   * @param {number} y координата по оси Y
   * @memberof PdfService
   */
  private addTitle(text: string, x: number, y: number): void {
    this.document.setFontSize(20);
    this.document.text(text, x, y);
  }

  /**
   * Добавление подзаголовка
   * @private
   * @param {string} text текст
   * @param {number} x координата по оси X
   * @param {number} y координата по оси Y
   * @memberof PdfService
   */
  private addSubtitle(text: string, x: number, y: number): void {
    this.document.setFontSize(14);
    this.document.text(text, x, y);
  }

  /**
   * Добавление текста
   * @private
   * @param {string} text текст
   * @param {number} x координата по оси X
   * @param {number} y координата по оси Y
   * @memberof PdfService
   */
  private addText(text: string, x: number, y: number): void {
    this.document.setFontSize(14);
    this.document.text(text, x, y, {
      maxWidth: this.stepWidth - 15 * 2
    });
  }

  /**
   * Добавление шага
   * @private
   * @param {RouteStep} step шаг
   * @memberof PdfService
   */
  private addStep(step: RouteStep): void {
    const maneuver: StepManeuver = step.maneuver;

    const label: string = `${maneuverType.get(maneuver.type) ?? 'Неизвестный тип маневра'}` + 
      ` ${maneuverModifier.get(maneuver.modifier) ?? ''}`
    + ` в точке ${maneuver.location[1]}, ${maneuver.location[0]} на`
    + ` угол ${Math.abs(maneuver.bearing_after - maneuver.bearing_before)}°`;

    // Расчет высоты, которую будет занимать текст
    const labelRows: number = Math.trunc((this.document.getTextDimensions(label).w / (this.stepWidth - 15 * 2))) + 1;
    const labelHeight: number = Math.ceil(labelRows * this.document.getTextDimensions(label).h);
    
    // При выходе за пределы текущей страницы, добавление новой страницы
    if (this.currentYOffset + 6 >= this.pageHeight 
        || this.currentYOffset + this.gap + labelHeight + 5 >= this.pageHeight) {
      this.document.addPage();
      this.currentYOffset = 10;
    } 
    
    this.document.roundedRect(10, this.currentYOffset, this.stepWidth, labelHeight + 5, 5, 5, 'S');
    this.addText(label, 15, this.currentYOffset + 6);
    this.currentYOffset += this.gap + labelHeight + 5;
  }

  /**
   * Скачивание файла
   * @param {RouteLeg[]} legs маршруты между ключевыми точками
   * @memberof PdfService
   */
  public dowloadFile(legs: RouteLeg[]): void {
    this.initDocument();
    this.addTitle('Маршрут', 10, 10);
    this.currentYOffset = 20;

    for (let i = 0; i < legs.length; ++i) {
      if (i !== 0) {
        this.currentYOffset += 5;
      }
      const leg: RouteLeg = legs[i];
      this.addSubtitle(`${leg.summary}; дистанция ${leg.distance.toFixed(0)} м.`, 10, this.currentYOffset);
      this.currentYOffset += 5;

      for (let p = 0; p < leg.steps.length; ++p) {
        
        const step: RouteStep = leg.steps[p];
        this.addStep(step);
      }
    }

    this.document.save('Маршрут.pdf');
  }
}