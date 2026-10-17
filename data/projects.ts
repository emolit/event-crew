export type ProjectSize = "standard" | "wide" | "tall";

export interface Project {
  id: string;
  title: string;
  type: string;
  roles: readonly string[];
  image: string;
  images?: readonly string[];
  alt: string;
  detailTitle?: string;
  description?: string;
  size: ProjectSize;
}

export const projects = [
  {
    id: "project-01",
    title: "Бренд-зона",
    type: "Фестивальная бренд-зона",
    roles: ["Хелперы", "Промоутеры", "Охрана"],
    image: "/images/projects/brand-zone-01.jpg",
    images: [
      "/images/projects/brand-zone-01.jpg",
      "/images/projects/brand-zone-02.jpg",
      "/images/projects/brand-zone-03.jpg",
    ],
    alt: "Команда бренд-зоны на фестивале DOBROFEST 2026",
    detailTitle: "DOBROFEST 2026 | Организация фестивальной бренд-зоны",
    description:
      "От подготовки площадки до общения с гостями — участие в создании яркого фестивального пространства. Помощь на монтаже и демонтаже бренд-зоны, поддержка интерактивных активностей и помощь в организации мероприятия, которое объединяет музыку, эмоции и людей.",
    size: "wide",
  },
  {
    id: "project-02",
    title: "Фестиваль",
    type: "Музыкальный фестиваль",
    roles: ["Хелперы", "Промоутеры"],
    image: "/images/projects/festival-01.jpg",
    images: [
      "/images/projects/festival-01.jpg",
      "/images/projects/festival-02.jpg",
      "/images/projects/festival-03.jpg",
    ],
    alt: "Гости и команда фестиваля Летник в Москве",
    detailTitle: "Фестиваль «Летник» | 29.05–31.05, Москва ☀️",
    description:
      "Три дня музыки, ярких эмоций и летней атмосферы! «Летник» — фестиваль, созданный командой P2P при поддержке наших хелперов, которые помогали воплощать идею в жизнь. Участие в организации события, помощь в подготовке площадки и поддержании её работы — вклад в создание пространства, где каждый гость мог стать частью большого летнего праздника.",
    size: "standard",
  },
  {
    id: "project-06",
    title: "Конференция",
    type: "Корпоративное мероприятие",
    roles: ["Хелперы", "Официанты"],
    image: "/images/projects/conference-01.jpg",
    images: [
      "/images/projects/conference-01.jpg",
      "/images/projects/conference-02.jpg",
    ],
    alt: "Конференция и церемония награждения для сотрудников компании",
    detailTitle: "Конференция",
    description:
      "Ежегодно предоставляем персонал для организации и проведения мероприятия для сотрудников компании. Программа включает конференцию, церемонию награждения и завершается гала-ужином.",
    size: "tall",
  },
  {
    id: "project-04",
    title: "Частное торжество",
    type: "Частное мероприятие",
    roles: ["Хостес", "Хелперы", "Охрана", "Гардеробщики"],
    image: "/images/projects/private-event-01.jpg",
    images: [
      "/images/projects/private-event-01.jpg",
      "/images/projects/private-event-02.jpg",
    ],
    alt: "Подготовка площадки для частного торжества",
    detailTitle: "Частное торжество",
    description:
      "Как правило, это закрытые корпоративные мероприятия, не предназначенные для широкой публики. Поэтому мы кратко расскажем о нашем опыте, не раскрывая названий и подробностей событий.\n\nДни рождения, юбилеи и другие торжества сложно представить без профессионального персонала, который помогает создать комфортную атмосферу и обеспечить высокий уровень обслуживания на протяжении всего мероприятия.",
    size: "standard",
  },
  {
    id: "project-05",
    title: "Вело-фестиваль",
    type: "Фестиваль",
    roles: ["Хелперы"],
    image: "/images/projects/bicycle-festival-01.jpg",
    images: [
      "/images/projects/bicycle-festival-01.jpg",
      "/images/projects/bicycle-festival-02.jpg",
      "/images/projects/bicycle-festival-03.jpg",
    ],
    alt: "Гранд-тур Пятёрочка в Яхроме",
    detailTitle: "Гранд-тур «Пятёрочка» | 22–23 августа, Яхрома",
    description:
      "Два дня драйва, активности и командной работы! Команда из 15 хелперов помогала в застройке площадки, сопровождении мероприятия и демонтаже.\n\nВ первый день гости наслаждались фестивалем, бренд-зонами и интерактивами, а во второй состоялись велозаезды, церемония награждения и выступление артиста. Мы рады стать частью этого яркого события!",
    size: "wide",
  },
] as const satisfies readonly Project[];

