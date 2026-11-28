import type { TranslateFn } from './useTranslation';

const PRODUCT_SLUG_BY_NAME: Record<string, string> = {
  'honey cake': 'honeyCake',
  'napoleon cake': 'napoleonCake',
  'red velvet cake': 'redVelvetCake',
  'chocolate truffle cake': 'chocolateTruffleCake',
  'cherry cake': 'cherryCake',
  'chocolate eclair': 'chocolateEclair',
  'macarons box': 'macaronsBox',
  tiramisu: 'tiramisu',
  'cherry cheesecake': 'cherryCheesecake',
  'cherry lemonade': 'cherryLemonade',
  latte: 'latte',
  cappuccino: 'cappuccino',
};

const MODIFIER_GROUP_KEY_BY_NAME: Record<string, string> = {
  size: 'catalog.group.size',
  extras: 'catalog.group.extras',
  box: 'catalog.group.box',
  topping: 'catalog.group.topping',
  syrup: 'catalog.group.syrup',
  milk: 'catalog.group.milk',
};

const MODIFIER_KEY_BY_NAME: Record<string, string> = {
  'small, 6 slices': 'catalog.mod.small6Slices',
  'medium, 10 slices': 'catalog.mod.medium10Slices',
  'large, 14 slices': 'catalog.mod.large14Slices',
  'fresh cherries': 'catalog.mod.freshCherries',
  'chocolate drip': 'catalog.mod.chocolateDrip',
  'custom inscription': 'catalog.mod.customInscription',
  '6 pieces': 'catalog.mod.pieces6',
  '12 pieces': 'catalog.mod.pieces12',
  'cherry sauce': 'catalog.mod.cherrySauce',
  'salted caramel': 'catalog.mod.saltedCaramel',
  'small, 300 ml': 'catalog.mod.small300Ml',
  'large, 500 ml': 'catalog.mod.large500Ml',
  'cherry syrup': 'catalog.mod.cherrySyrup',
  'vanilla syrup': 'catalog.mod.vanillaSyrup',
  'caramel syrup': 'catalog.mod.caramelSyrup',
  'oat milk': 'catalog.mod.oatMilk',
  'almond milk': 'catalog.mod.almondMilk',
  'small, 250 ml': 'catalog.mod.small250Ml',
  'medium, 350 ml': 'catalog.mod.medium350Ml',
  'large, 450 ml': 'catalog.mod.large450Ml',
};

const ZONE_KEY_BY_NAME: Record<string, string> = {
  center: 'catalog.zone.center',
  suburbs: 'catalog.zone.suburbs',
};

function norm(value: string): string {
  return (value || '').trim().toLowerCase();
}

export function translateProductName(t: TranslateFn, name: string): string {
  const slug = PRODUCT_SLUG_BY_NAME[norm(name)];
  return slug ? t(`catalog.prod.${slug}.name`, name) : name;
}

export function translateProductDescription(
  t: TranslateFn,
  productName: string,
  fallbackDescription: string,
): string {
  const slug = PRODUCT_SLUG_BY_NAME[norm(productName)];
  return slug ? t(`catalog.prod.${slug}.desc`, fallbackDescription) : fallbackDescription;
}

export function translateModifierGroupName(t: TranslateFn, name: string): string {
  const key = MODIFIER_GROUP_KEY_BY_NAME[norm(name)];
  return key ? t(key, name) : name;
}

export function translateModifierName(t: TranslateFn, name: string): string {
  const key = MODIFIER_KEY_BY_NAME[norm(name)];
  return key ? t(key, name) : name;
}

export function translateDeliveryZoneName(t: TranslateFn, name: string): string {
  const key = ZONE_KEY_BY_NAME[norm(name)];
  return key ? t(key, name) : name;
}
