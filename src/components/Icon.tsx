import type { SVGProps } from 'react';
import {
  BsFlower1,
  BsFlower2,
  BsFlower3,
  BsTree,
  BsBook,
  BsJournalBookmark,
  BsCheckCircleFill,
  BsGlobeAmericas,
  BsGlobeEuropeAfrica,
  BsTrophy,
  BsBalloonFill,
  BsClipboardCheck,
  BsClipboardData,
  BsCupHot,
  BsCupHotFill,
  BsEggFried,
  BsBasket,
  BsFire,
  BsLightbulb,
  BsLightbulbFill,
  BsCalendar3,
  BsSunrise,
  BsSun,
  BsPeople,
  BsPeopleFill,
  BsBullseye,
  BsBuildings,
  BsHeart,
  BsHeartPulse,
  BsPeace,
  BsDroplet,
  BsShieldCheck,
  BsShieldSlash,
  BsSlashCircle,
  BsMoonStars,
  BsLightningChargeFill,
  BsSpeedometer,
  BsPerson,
  BsPersonBadge,
  BsPersonLinesFill,
  BsHouseHeart,
  BsGeoAlt,
  BsCamera
} from 'react-icons/bs';

const ICONS = {
  sprout: BsFlower1,
  foliage: BsFlower2,
  blossom: BsFlower3,
  tree: BsTree,
  book: BsBook,
  journal: BsJournalBookmark,
  checkCircle: BsCheckCircleFill,
  globe: BsGlobeAmericas,
  globeAlt: BsGlobeEuropeAfrica,
  trophy: BsTrophy,
  celebration: BsBalloonFill,
  clipboard: BsClipboardCheck,
  clipboardData: BsClipboardData,
  hotDrink: BsCupHot,
  hotDrinkFill: BsCupHotFill,
  dish: BsEggFried,
  basket: BsBasket,
  fire: BsFire,
  lightbulb: BsLightbulb,
  lightbulbFill: BsLightbulbFill,
  calendar: BsCalendar3,
  sunrise: BsSunrise,
  sun: BsSun,
  people: BsPeople,
  peopleFill: BsPeopleFill,
  bullseye: BsBullseye,
  buildings: BsBuildings,
  heart: BsHeart,
  heartPulse: BsHeartPulse,
  peace: BsPeace,
  droplet: BsDroplet,
  shield: BsShieldCheck,
  shieldSlash: BsShieldSlash,
  slashCircle: BsSlashCircle,
  moonStars: BsMoonStars,
  lightning: BsLightningChargeFill,
  speedometer: BsSpeedometer,
  person: BsPerson,
  personBadge: BsPersonBadge,
  personLines: BsPersonLinesFill,
  houseHeart: BsHouseHeart,
  location: BsGeoAlt,
  camera: BsCamera
};

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
  label?: string;
}

export function Icon({ name, label, className, ...props }: IconProps) {
  const IconComponent = ICONS[name];

  if (!IconComponent) {
    return null;
  }

  const ariaProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <IconComponent
      className={className}
      focusable="false"
      {...ariaProps}
      {...props}
    />
  );
}
