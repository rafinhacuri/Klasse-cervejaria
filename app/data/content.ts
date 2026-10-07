import { pick } from '~/utils/pick'

interface Beer {
  id: string
  name: string
  style: string
  abv: number
  ibu: number
  price: number
  notes: string
  color: string
  deep: string
  foam: string
  haze: number
}

interface Vessel {
  id: string
  name: string
  liters: number
  price: number
  serves: string
  notes: string
}

interface Hours {
  days: string
  time: string
}

const brand = {
  full: 'Klasse Cervejaria',
  city: 'Rio de Janeiro',
}

const hours: Hours[] = [
  { days: 'Segunda a sexta', time: '8h às 18h' },
  { days: 'Sábado', time: '8h às 13h' },
  { days: 'Eventos', time: 'Todos os dias' },
]

const beers: Beer[] = [
  {
    id: 'pilsen',
    name: 'Pilsen',
    style: 'German Pilsner',
    abv: 4.8,
    ibu: 22,
    price: 24.9,
    notes: 'Dourada, seca e limpa. A de todo dia, a que abre a roda.',
    color: '#f6b92b',
    deep: '#7a3c04',
    foam: '#fff6e2',
    haze: 0,
  },
  {
    id: 'weiss',
    name: 'Weiss',
    style: 'Hefeweizen',
    abv: 5.2,
    ibu: 12,
    price: 27.9,
    notes: 'Turva de trigo, com banana e cravo no aroma. Macia do início ao fim.',
    color: '#f0b34a',
    deep: '#8a4a10',
    foam: '#fffaf0',
    haze: 0.55,
  },
  {
    id: 'session',
    name: 'Session IPA',
    style: 'Session IPA',
    abv: 4.5,
    ibu: 40,
    price: 29.9,
    notes: 'Lúpulo cítrico sem pesar. Dá pra tomar a tarde inteira.',
    color: '#eaa12c',
    deep: '#6e3404',
    foam: '#fff4dc',
    haze: 0.2,
  },
  {
    id: 'ipa',
    name: 'IPA',
    style: 'American IPA',
    abv: 6.5,
    ibu: 60,
    price: 32.9,
    notes: 'Amarga e resinosa, com maracujá e pinho saltando do copo.',
    color: '#d9861a',
    deep: '#5a2604',
    foam: '#fff0d2',
    haze: 0.1,
  },
  {
    id: 'red',
    name: 'Red Ale',
    style: 'Irish Red Ale',
    abv: 5.6,
    ibu: 28,
    price: 29.9,
    notes: 'Caramelo, biscoito e um final levemente tostado.',
    color: '#b5441a',
    deep: '#3c0f04',
    foam: '#f6e3c8',
    haze: 0,
  },
  {
    id: 'stout',
    name: 'Stout',
    style: 'Dry Stout',
    abv: 4.8,
    ibu: 35,
    price: 31.9,
    notes: 'Café, cacau e espuma bege. Cremosa e surpreendentemente leve.',
    color: '#4a1d0a',
    deep: '#0d0503',
    foam: '#dcbb8e',
    haze: 0,
  },
]

const vessels: Vessel[] = [
  {
    id: 'keg-20',
    name: 'Barril',
    liters: 20,
    price: 389,
    serves: 'até 25 pessoas',
    notes: 'O mais pedido. Cabe no carro, gela rápido e segura o churrasco inteiro.',
  },
  {
    id: 'keg-30',
    name: 'Barril',
    liters: 30,
    price: 549,
    serves: 'até 40 pessoas',
    notes: 'Para aniversário e confraternização. Vai com chopeira de uma torneira.',
  },
  {
    id: 'keg-50',
    name: 'Barril',
    liters: 50,
    price: 849,
    serves: 'até 70 pessoas',
    notes: 'Para casamento e festa grande. Chopeira de duas torneiras inclusa.',
  },
]

const kegSizes = [50, 30, 20]

function price(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function beerById(id: string): Beer {
  return beers.find((beer) => beer.id === id) ?? pick(beers, 0)
}

export type { Beer, Hours, Vessel }
export { beerById, beers, brand, hours, kegSizes, price, vessels }
