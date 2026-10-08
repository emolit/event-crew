export interface Advantage {
  id: string;
  title: string;
  description: string;
}

export const advantages = [
  {
    id: "quick-selection",
    title: "Быстрый подбор",
    description: "Подбираем команду под задачу и формат вашего мероприятия.",
  },
  {
    id: "attendance-control",
    title: "Контроль выхода",
    description: "Проверяем готовность персонала перед началом работы на площадке.",
  },
  {
    id: "fast-replacement",
    title: "Оперативная замена",
    description: "Быстро находим замену, если обстоятельства меняются.",
  },
  {
    id: "individual-approach",
    title: "Индивидуальный подход",
    description: "Учитываем сценарий, площадку и требования каждого проекта.",
  },
] as const satisfies readonly Advantage[];

