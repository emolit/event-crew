export interface ProcessStep {
  number: "01" | "02" | "03" | "04";
  title: string;
  description: string;
}

export const processSteps = [
  {
    number: "01",
    title: "Заявка",
    description: "Обсуждаем мероприятие, площадку и задачи.",
  },
  {
    number: "02",
    title: "Подбор",
    description: "Подбираем команду под формат события.",
  },
  {
    number: "03",
    title: "Согласование",
    description: "Согласовываем состав, график и условия работы.",
  },
  {
    number: "04",
    title: "Мероприятие",
    description: "Выходим на площадку и обеспечиваем слаженную работу.",
  },
] as const satisfies readonly ProcessStep[];

