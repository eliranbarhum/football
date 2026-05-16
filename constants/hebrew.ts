import { Player } from './players';

export function positionToHebrew(position: Player['position']): string {
  switch (position) {
    case 'Goalkeeper':
      return 'שוער';
    case 'Defender':
      return 'הגנה';
    case 'Midfielder':
      return 'קשר';
    case 'Forward':
      return 'חלוץ';
    default:
      return position;
  }
}
