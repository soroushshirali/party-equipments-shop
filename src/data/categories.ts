const categories = [
  {
    groupTitle: "تجهیزات نشیمن",
    items: [
      {
        title: "میز و صندلی",
        items: [
          { title: "مبلمان بار", categoryId: "bar-furniture" },
          { title: "اجاره صندلی", categoryId: "chair-hire" },
          { title: "مبل و نیمکت", categoryId: "couch-ottoman" },
          { title: "اجاره میز", categoryId: "table-hire" },
        ]
      }
    ]
  },
  {
    groupTitle: "سازه‌های موقت",
    items: [
      {
        title: "چادر، غرفه و چتر",
        items: [
          { title: "اجاره چادر", categoryId: "marquee-hire" },
          { title: "اجاره غرفه", categoryId: "stall-hire" },
          { title: "اجاره چتر", categoryId: "umbrella-hire" },
          { title: "اجاره چادر سیار", categoryId: "popup-marquee" },
        ]
      }
    ]
  },
  {
    groupTitle: "تجهیزات نمایشی",
    items: [
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
    ]
  }
];

module.exports = { categories };