import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProjectForm from "@/components/admin/ProjectForm";
import ProjectGalleryEditor from "@/components/admin/ProjectGalleryEditor";
import SortableList from "@/components/admin/SortableList";

describe("project admin controls", () => {
  test("renders all project fields with approved size choices", () => {
    render(<ProjectForm action={vi.fn()} initial={null} />);
    expect(screen.getByLabelText("Название карточки")).toBeRequired();
    expect(screen.getByLabelText("Тип мероприятия")).toBeRequired();
    expect(screen.getByLabelText("Заголовок описания")).toBeRequired();
    expect(screen.getByLabelText("Описание")).toBeRequired();
    expect(screen.getByLabelText("Размер карточки")).toHaveTextContent("Широкая");
    expect(screen.getByRole("button", { name: "Сохранить проект" })).toBeInTheDocument();
  });

  test("supports explicit mobile and keyboard ordering controls", () => {
    const onChange = vi.fn();
    render(<SortableList items={[{ id: 1, label: "Первый" }, { id: 2, label: "Второй" }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Переместить Второй вверх" }));
    expect(onChange).toHaveBeenCalledWith([2, 1]);
  });

  test("shows gallery previews and a delete control for each photo", () => {
    render(<ProjectGalleryEditor images={[{ id: 4, mediaId: "m", url: "/photo.webp", alt: "Команда", sortOrder: 0 }]} onChange={vi.fn()} />);
    expect(screen.getByRole("img", { name: "Команда" })).toHaveAttribute("src", "/photo.webp");
    expect(screen.getByRole("button", { name: "Удалить фотографию Команда" })).toBeInTheDocument();
    expect(screen.getByLabelText("Добавить фотографии")).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
  });
});
