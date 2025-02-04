import { Category } from '@/types/types';

export const categories: Category[] = [
  {
    title: "میز و صندلی",
    items: [
      { title: "مبلمان بار", categoryId: "bar-furniture" },
      { title: "اجاره صندلی", categoryId: "chair-hire" },
      { title: "مبل و نیمکت", categoryId: "couch-ottoman" },
      { title: "اجاره میز", categoryId: "table-hire" },
    ]
  },
  {
    title: "چادر، غرفه و چتر",
    items: [
      { title: "اجاره چادر", categoryId: "marquee-hire", borderColor: "border-purple-500" },
      { title: "اجاره غرفه", categoryId: "stall-hire", borderColor: "border-purple-500" },
      { title: "اجاره چتر", categoryId: "umbrella-hire", borderColor: "border-purple-500" },
      { title: "اجاره چادر سیار", categoryId: "popup-marquee", borderColor: "border-purple-500" },
    ]
  },
  {
    title: "صوت، نور و تصویر",
    items: [
      { title: "سیستم صوتی", categoryId: "audio" },
      { title: "دستگاه پخش موسیقی", categoryId: "jukebox" },
      { title: "تریبون", categoryId: "lectern" },
      { title: "نورپردازی", categoryId: "lighting" },
      { title: "میکروفون", categoryId: "microphone" },
      { title: "دستگاه افکت", categoryId: "effects" },
      { title: "اجاره تلویزیون", categoryId: "tv-hire" },
      { title: "پروژکتور و پرده", categoryId: "projector" },
    ]
  }
];