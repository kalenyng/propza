import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortNumber', standalone: true })
export class ShortNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1_000_000) return `R ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (value >= 1_000) return `R ${Math.round(value / 1_000)}K`;
    return `R ${value.toLocaleString()}`;
  }
}
