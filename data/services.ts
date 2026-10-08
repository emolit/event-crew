export interface Service {
  id: "helpers" | "promoters" | "hostess" | "waiters" | "coordinators" | "cloakroom" | "security" | "riggers";
  name: string;
  description: string;
  price: number;
  image: string;
  alt: string;
}

export const services = [
  {
    id: "helpers",
    name: "Хелперы",
    description: "Помогают с подготовкой, навигацией и организационными задачами на площадке.",
    price: 700,
    image: "/images/services/service-helpers.webp",
    alt: "Хелпер помогает подготовить площадку мероприятия",
  },
  {
    id: "promoters",
    name: "Промоутеры",
    description: "Представляют проект, общаются с аудиторией и поддерживают активность на площадке.",
    price: 750,
    image: "/images/services/service-promoters.webp",
    alt: "Промоутеры работают с гостями на выставочной площадке",
  },
  {
    id: "hostess",
    name: "Хостес",
    description: "Встречают гостей, помогают с навигацией и создают первое впечатление о событии.",
    price: 850,
    image: "/images/services/service-hostess.webp",
    alt: "Хостес встречает гостей на мероприятии",
  },
  {
    id: "waiters",
    name: "Официанты",
    description: "Обеспечивают внимательное обслуживание гостей на банкетах и деловых событиях.",
    price: 650,
    image: "/images/services/service-waiters.webp",
    alt: "Официант обслуживает гостей на банкете",
  },
  {
    id: "coordinators",
    name: "Координаторы",
    description: "Следят за таймингом, командой и задачами на каждом этапе мероприятия.",
    price: 850,
    image: "/images/services/service-coordinators.webp",
    alt: "Координатор управляет работой команды на площадке",
  },
  {
    id: "cloakroom",
    name: "Гардеробщики",
    description: "Организуют работу гардероба и помогают гостям чувствовать себя комфортно.",
    price: 550,
    image: "/images/services/service-cloakroom.webp",
    alt: "Сотрудник принимает верхнюю одежду в гардеробе",
  },
  {
    id: "security",
    name: "Охрана",
    description: "Поддерживает порядок на площадке, контролирует вход и спокойно реагирует на нестандартные ситуации.",
    price: 700,
    image: "/images/services/service-security.jpg",
    alt: "Сотрудник охраны работает на мероприятии",
  },
  {
    id: "riggers",
    name: "Грузчики / такелажники",
    description: "Перемещают оборудование, работают с конструкциями и помогают провести монтаж и демонтаж.",
    price: 700,
    image: "/images/services/service-riggers.jpg",
    alt: "Такелажник перемещает сценическое оборудование",
  },
] as const satisfies readonly Service[];

