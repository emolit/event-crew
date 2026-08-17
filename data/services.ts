export interface Service {
  id: "hostess" | "promoters" | "helpers" | "waiters" | "coordinators" | "cloakroom" | "registrars" | "animators";
  name: string;
  description: string;
  image: string;
  alt: string;
}

export const services = [
  {
    id: "hostess",
    name: "Хостес",
    description: "Встречают гостей, сверяют списки и показывают маршрут по площадке.",
    image: "/images/services/service-hostess.webp",
    alt: "Хостес встречает гостей на мероприятии",
  },
  {
    id: "promoters",
    name: "Промоутеры",
    description: "Рассказывают о продукте, раздают материалы и собирают контакты гостей.",
    image: "/images/services/service-promoters.webp",
    alt: "Промоутеры работают с гостями на выставочной площадке",
  },
  {
    id: "helpers",
    name: "Хелперы",
    description: "Расставляют материалы, направляют потоки гостей и выполняют задачи координатора.",
    image: "/images/services/service-helpers.webp",
    alt: "Хелперы помогают подготовить площадку мероприятия",
  },
  {
    id: "waiters",
    name: "Официанты",
    description: "Сервируют столы, подают блюда и убирают посуду по плану площадки.",
    image: "/images/services/service-waiters.webp",
    alt: "Официант обслуживает гостей на банкете",
  },
  {
    id: "coordinators",
    name: "Координаторы",
    description: "Распределяют задачи, сверяют тайминг и держат связь с заказчиком.",
    image: "/images/services/service-coordinators.webp",
    alt: "Координатор управляет работой команды на площадке",
  },
  {
    id: "cloakroom",
    name: "Гардеробщики",
    description: "Принимают одежду, выдают номерки и следят за порядком в гардеробе.",
    image: "/images/services/service-cloakroom.webp",
    alt: "Сотрудник принимает верхнюю одежду в гардеробе",
  },
  {
    id: "registrars",
    name: "Регистраторы",
    description: "Находят участника в списке, выдают бейдж и отмечают его приход.",
    image: "/images/services/service-registrars.webp",
    alt: "Регистратор встречает участников у стойки регистрации",
  },
  {
    id: "animators",
    name: "Аниматоры",
    description: "Проводят игры по сценарию и работают с детской аудиторией.",
    image: "/images/services/service-animators.webp",
    alt: "Аниматор проводит активность для гостей мероприятия",
  },
] as const satisfies readonly Service[];

