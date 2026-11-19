import type { Activity } from '../types.ts';

// Reviewed against the linked operators' pages on 19 November 2026.
// Coordinates are approximate postcode centres, so directions should be
// confirmed against each venue's address. Recheck these records regularly.
// No entry here asserts a bookable session or event ticket is available.
export const curatedActivities: Activity[] = [
  {
    id: 'curated-hollywood-bowl-stockton', name: 'Hollywood Bowl Stockton', category: 'entertainment',
    description: 'Bowling, mini golf and arcade games at Teesside Park. Lanes and games can fill up, so check booking slots before setting off.',
    lat: 54.560176, lon: -1.273824, town: 'Stockton-on-Tees',
    address: 'Teesside Park Drive, Thornaby, Stockton-on-Tees, TS17 7BU',
    openingHours: 'Mo-Th 10:00-23:00; Fr 10:00-24:00; Sa 09:00-24:00; Su 09:00-23:00',
    audiences: ['solo', 'couple', 'friends', 'family', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://www.hollywoodbowl.co.uk/stockton', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-rockantics', name: 'Rockantics', category: 'sport',
    description: 'Try bouldering or roped climbing at this Middlesbrough centre. Check session slots, supervision and age rules before booking.',
    lat: 54.564883, lon: -1.216625, town: 'Middlesbrough',
    address: 'Unit K, Warelands Way, Longlands Road, Middlesbrough, TS4 2JY',
    openingHours: 'Mo 13:00-21:00; Tu-Th 13:00-21:30; Fr 13:00-21:00; Sa 10:00-19:00; Su 10:00-17:00',
    audiences: ['solo', 'couple', 'friends', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://rockantics.co.uk/', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-mima', name: 'MIMA', category: 'culture',
    description: 'Explore contemporary art in Middlesbrough’s Centre Square. Exhibitions and admission terms can vary; check the current programme.',
    lat: 54.574422, lon: -1.232623, town: 'Middlesbrough',
    address: 'Centre Square, Middlesbrough, TS1 2AZ',
    openingHours: 'Tu-Sa 10:00-16:30; Su 12:00-16:00',
    audiences: ['solo', 'couple', 'friends', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://mima.art/', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-dorman-museum', name: 'Dorman Museum', category: 'culture',
    description: 'Discover Middlesbrough history, natural history and the Linthorpe Art Pottery collection. Check the council page for visit updates.',
    lat: 54.564229, lon: -1.240903, town: 'Middlesbrough',
    address: 'Linthorpe Road, Middlesbrough, TS5 6LA',
    openingHours: 'Tu-Su 10:00-16:00', pricePence: 0,
    priceNote: 'Council lists general admission as free; special events may differ',
    audiences: ['solo', 'couple', 'friends', 'family', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://www.middlesbrough.gov.uk/leisure-culture-and-parks/entertainment-and-museums/dorman-museum/', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-preston-park-museum', name: 'Preston Park Museum', category: 'family',
    description: 'Visit the museum and its recreated Victorian street. The published last admission is 3:30pm; check ticket details before visiting.',
    lat: 54.535542, lon: -1.337391, town: 'Stockton-on-Tees',
    address: 'Yarm Road, Eaglescliffe, Stockton-on-Tees, TS18 3RH',
    openingHours: 'Tu-Su 10:00-16:00', lastAdmissionAt: '15:30',
    audiences: ['solo', 'couple', 'friends', 'family', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://prestonparkmuseum.co.uk/opening-times', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-tees-barrage', name: 'Tees Barrage Water Sports Centre', category: 'sport',
    description: 'An adventure centre for paddling and white water activities beside the River Tees. Centre hours do not guarantee an activity session; book with the operator.',
    lat: 54.565321, lon: -1.289120, town: 'Stockton-on-Tees',
    address: 'Tees Barrage Way, Stockton-on-Tees, TS18 2QW',
    openingHours: 'Mo-Su 09:00-16:30',
    audiences: ['solo', 'couple', 'friends', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://www.teesactive.co.uk/tees-barrage/', reviewedOn: '2026-11-19',
  },
  {
    id: 'curated-billingham-forum', name: 'Billingham Forum', category: 'sport',
    description: 'A leisure centre with an ice arena, pool, climbing and gym. Building hours are listed; check the specific activity timetable and booking rules.',
    lat: 54.606776, lon: -1.288895, town: 'Billingham',
    address: 'The Causeway, Billingham Town Centre, TS23 2LJ',
    openingHours: 'Mo-Fr 06:00-22:00; Sa 06:30-19:00; Su 06:30-21:30',
    audiences: ['solo', 'couple', 'friends', 'family', 'group'], source: 'curated', demo: false,
    sourceUrl: 'https://www.teesactive.co.uk/billingham-forum/', reviewedOn: '2026-11-19',
  },
];
