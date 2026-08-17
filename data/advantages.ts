export interface Advantage {
  id: string;
  title: string;
  description: string;
}

export const advantages = [
  {
    id: "quick-selection",
    title: "Фиксируем состав и смены",
    description: "Записываем роли, количество сотрудников и часы работы до согласования заказа.",
  },
  {
    id: "attendance-control",
    title: "Подтверждаем выход",
    description: "Связываемся с каждым сотрудником до начала смены и сверяем время приезда.",
  },
  {
    id: "fast-replacement",
    title: "Остаёмся на связи",
    description: "Координатор отвечает на вопросы заказчика и команды в день события.",
  },
  {
    id: "individual-approach",
    title: "Находим замену",
    description: "Если сотрудник не может выйти, ищем другого до начала смены.",
  },
] as const satisfies readonly Advantage[];

