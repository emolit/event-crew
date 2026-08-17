export interface ProcessStep {
  number: "01" | "02" | "03" | "04";
  title: string;
  description: string;
}

export const processSteps = [
  {
    number: "01",
    title: "Бриф",
    description: "Вы присылаете дату, адрес, график и список нужных ролей.",
  },
  {
    number: "02",
    title: "Состав и смета",
    description: "Мы предлагаем состав команды, график смен и стоимость.",
  },
  {
    number: "03",
    title: "Подтверждение",
    description: "Вы согласуете людей, а мы подтверждаем каждому время выхода.",
  },
  {
    number: "04",
    title: "Выход команды",
    description: "Сотрудники приезжают на площадку и приступают к своим задачам.",
  },
] as const satisfies readonly ProcessStep[];

