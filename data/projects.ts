export type ProjectSize = "standard" | "wide" | "tall";

export interface Project {
  id: string;
  title: string;
  type: string;
  roles: readonly string[];
  image: string;
  alt: string;
  size: ProjectSize;
}

export const projects = [
  {
    id: "project-01",
    title: "Корпоративный приём",
    type: "Корпоративное мероприятие",
    roles: ["Хостес", "Координаторы"],
    image: "/images/projects/project-01.webp",
    alt: "Персонал сопровождает гостей на корпоративном приёме",
    size: "wide",
  },
  {
    id: "project-02",
    title: "Деловая конференция",
    type: "Конференция",
    roles: ["Регистраторы", "Координаторы"],
    image: "/images/projects/project-02.webp",
    alt: "Регистрация гостей на деловой конференции",
    size: "standard",
  },
  {
    id: "project-03",
    title: "Выставочная площадка",
    type: "Выставка",
    roles: ["Промоутеры", "Хелперы"],
    image: "/images/projects/project-03.webp",
    alt: "Команда персонала работает на выставочной площадке",
    size: "tall",
  },
  {
    id: "project-04",
    title: "Частное торжество",
    type: "Частное мероприятие",
    roles: ["Хостес", "Официанты"],
    image: "/images/projects/project-04.webp",
    alt: "Персонал обслуживает гостей частного торжества",
    size: "standard",
  },
  {
    id: "project-05",
    title: "Городское событие",
    type: "Открытое мероприятие",
    roles: ["Координаторы", "Хелперы"],
    image: "/images/projects/project-05.webp",
    alt: "Координатор помогает гостям на городском событии",
    size: "wide",
  },
  {
    id: "project-06",
    title: "Вечерний гала-ужин",
    type: "Гала-ужин",
    roles: ["Официанты", "Гардеробщики"],
    image: "/images/projects/project-06.webp",
    alt: "Официанты обслуживают гостей на вечернем гала-ужине",
    size: "tall",
  },
] as const satisfies readonly Project[];

