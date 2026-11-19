export const RADIUS_CHOICES = [5, 10, 20, 30, 50] as const;
export const BUDGET_CHOICES = ['any', 'free', 'under10', 'under25', 'under50', 'over50'] as const;
export const AUDIENCE_CHOICES = ['solo', 'couple', 'friends', 'family', 'group'] as const;
export const CATEGORY_CHOICES = ['surprise', 'food', 'entertainment', 'outdoor', 'family', 'sport', 'culture', 'nightlife', 'events', 'hidden'] as const;
export const WHEN_CHOICES = ['now', 'today', 'tonight', 'weekend', 'date'] as const;

export type Budget = typeof BUDGET_CHOICES[number];
export type Audience = typeof AUDIENCE_CHOICES[number];
export type CategoryChoice = typeof CATEGORY_CHOICES[number];
export type Category = Exclude<CategoryChoice, 'surprise'>;
export type When = typeof WHEN_CHOICES[number];
export type ActivitySource = 'osm' | 'geoapify' | 'ticketmaster' | 'curated' | 'demo';

export interface Filters {
  location: string;
  lat?: number;
  lon?: number;
  radius: typeof RADIUS_CHOICES[number];
  budget: Budget;
  audience: Audience;
  category: CategoryChoice;
  when: When;
  date?: string;
  demo: boolean;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: Category;
  lat: number;
  lon: number;
  town: string;
  address?: string;
  venue?: string;
  organiser?: string;
  pricePence?: number;
  priceNote?: string;
  openingHours?: string;
  startsAt?: string;
  endsAt?: string;
  audiences: Audience[];
  source: ActivitySource;
  sourceUrl?: string;
  affiliateUrl?: string;
  affiliateDisclosure?: string;
  distanceMiles?: number;
  demo: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  location: 'Middlesbrough', radius: 10, budget: 'any', audience: 'friends',
  category: 'surprise', when: 'today', demo: false,
};

export const CATEGORY_LABELS: Record<CategoryChoice, string> = {
  surprise: 'Surprise me', food: 'Food & drink', entertainment: 'Entertainment',
  outdoor: 'Outdoor adventures', family: 'Family activities', sport: 'Sports & fitness',
  culture: 'Arts & culture', nightlife: 'Nightlife', events: 'Live events', hidden: 'Hidden gems',
};
export const BUDGET_LABELS: Record<Budget, string> = {
  any: 'Any budget', free: 'Free', under10: 'Under £10', under25: 'Under £25', under50: 'Under £50', over50: '£50+',
};
export const AUDIENCE_LABELS: Record<Audience, string> = {
  solo: 'Solo', couple: 'Couple / date night', friends: 'Friends', family: 'Family with children', group: 'Group',
};
export const WHEN_LABELS: Record<When, string> = {
  now: 'Right now', today: 'Today', tonight: 'Tonight', weekend: 'This weekend', date: 'Choose a date',
};
