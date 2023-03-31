import { Pipe, PipeTransform } from '@angular/core';

/**
 * Пайп для трансформации цены (пробел через каждый 3 символа и валюта)
 * @export
 * @class PricePipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'price'})
export class PricePipe implements PipeTransform {
  public transform(value: number, currency: string): string {
    const valueStr: string = value.toString();
    if (valueStr.length < 3) {
      return `${value}${currency}`;
    }
    const reversedDigits: string[] = valueStr.split('').reverse();
    const priceStr: string = reversedDigits.map((digit: string, index: number) => 
      index % 3 === 2 ? ` ${digit}` : `${digit}`).reverse().join('');
    return `${priceStr} ${currency}.`;
  }
}