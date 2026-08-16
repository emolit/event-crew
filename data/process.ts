export interface ProcessStep {
  number: "01" | "02" | "03" | "04";
  title: string;
  description: string;
}

export const processSteps = [
  {
    number: "01",
    title: "Заявка",
    description: "Расскажите о мероприятии, площадке и нужном составе команды.",
  },
  {
    number: "02",
    title: "Подбор",
    description: "Подбираем подходящих сотрудников под формат и задачи события.",
  },
  {
    number: "03",
    title: "Согласование",
    description: "Фиксируем состав команды, график и детали работы на площадке.",
  },
  {
    number: "04",
    title: "Мероприятие",
    description: "Команда приезжает вовремя и помогает провести событие спокойно.",
  },
] as const satisfies readonly ProcessStep[];

