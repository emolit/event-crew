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
    description: "Встречают гостей, помогают с навигацией и создают первое впечатление о событии.",
    image: "/images/services/service-hostess.webp",
    alt: "Хостес встречает гостей на мероприятии",
  },
  {
    id: "promoters",
    name: "Промоутеры",
    description: "Представляют проект, общаются с аудиторией и поддерживают активность на площадке.",
    image: "/images/services/service-promoters.webp",
    alt: "Промоутеры работают с гостями на выставочной площадке",
  },
  {
    id: "helpers",
    name: "Хелперы",
    description: "Помогают с подготовкой, навигацией и организационными задачами на площадке.",
    image: "/images/services/service-helpers.webp",
    alt: "Хелперы помогают подготовить площадку мероприятия",
  },
  {
    id: "waiters",
    name: "Официанты",
    description: "Обеспечивают внимательное обслуживание гостей на банкетах и деловых событиях.",
    image: "/images/services/service-waiters.webp",
    alt: "Официант обслуживает гостей на банкете",
  },
  {
    id: "coordinators",
    name: "Координаторы",
    description: "Следят за таймингом, командой и задачами на каждом этапе мероприятия.",
    image: "/images/services/service-coordinators.webp",
    alt: "Координатор управляет работой команды на площадке",
  },
  {
    id: "cloakroom",
    name: "Гардеробщики",
    description: "Организуют работу гардероба и помогают гостям чувствовать себя комфортно.",
    image: "/images/services/service-cloakroom.webp",
    alt: "Сотрудник принимает верхнюю одежду в гардеробе",
  },
  {
    id: "registrars",
    name: "Регистраторы",
    description: "Встречают участников, работают со списками и помогают пройти регистрацию.",
    image: "/images/services/service-registrars.webp",
    alt: "Регистратор встречает участников у стойки регистрации",
  },
  {
    id: "animators",
    name: "Аниматоры",
    description: "Проводят активности для гостей и поддерживают атмосферу семейных мероприятий.",
    image: "/images/services/service-animators.webp",
    alt: "Аниматор проводит активность для гостей мероприятия",
  },
] as const satisfies readonly Service[];

