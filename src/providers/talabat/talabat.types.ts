

export interface TalabatLocation {
  location_name: string;
  location_slug: string;
  location_id: number | string;
}

export interface TalabatLocationRawDocument {
  _id?: unknown;

  domain?: string;

  payload?: {
    results?: TalabatLocation[];
  };
}

export interface TalabatRestaurantListItem {
  area_name: string;
  restaurant_name: string;
  restaurant_url: string;
}

export interface TalabatRestaurantRawDocument {
  _id?: unknown;

  domain?: string;

  params?: {
    domain?: string;
    areaSlug?: string;
    areaId?: string | number;
    page_no?: number;
  };

  payload?: {
    ['Total Page']?: number;

    ['Page Error Message']?: string;

    error?: string;

    results?: TalabatRestaurantListItem[];
  };
}

export interface TalabatMenuItem {
  item_id:
    number | string;

  item_name:
    string;

  description?:
    string | null;

  price?:
    number | string | null;

  rating?:
    number | string | null;

  image?:
    string | null;
}

export interface TalabatMenuCategory {
  category_id:
    number | string;

  category_name:
    string;

  items?:
    TalabatMenuItem[] | null;
}



export interface TalabatMenuRestaurant {
  id?:
    number | string | null;

  name:
    string;

  logo?:
    string | null;

  latitude?:
    number | string | null;

  longitude?:
    number | string | null;

  rate?:
    number | string | null;

  totalReviews?:
    number | string | null;

  totalRatings?:
    number | string | null;

  deliveryFee?:
    number | string | null;

  DeliveryTime?:
    string | null;

  ['Minimum Order']?:
    number | string | null;

  ['Restaurant Address']?:
    string | null;

  City?:
    string | null;

  Contact?:
    string | null;

  outletCode:
    number | string;

  category?:
    TalabatMenuCategory[] | null;
}

export interface TalabatMenuRawDocument {
  _id?: unknown;

  domain?: string;

  params?: {
    restaurant_url?: string;
  };

  payload?: {
    Message?: string;

    error?: string;

    results?: TalabatMenuRestaurant[];
  };
}