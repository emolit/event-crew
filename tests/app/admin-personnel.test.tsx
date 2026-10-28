import { fireEvent, render, screen } from "@testing-library/react"; import { describe, expect, test, vi } from "vitest";
import PersonnelForm from "@/components/admin/PersonnelForm"; import SortableList from "@/components/admin/SortableList";
describe("personnel admin",()=>{
 test("renders current price, description and portrait preview",()=>{render(<PersonnelForm action={vi.fn()} initial={{id:1,slug:"waiter",name:"Официанты",description:"Обслуживание гостей",price:700,mediaId:"m",image:"/person.webp",alt:"Официант",sortOrder:0,deletedAt:null}}/>); expect(screen.getByLabelText("Цена за час")).toHaveValue(700); expect(screen.getByRole("img",{name:"Официант"})).toBeInTheDocument(); expect(screen.getByLabelText("Цена за час")).toHaveAttribute("min","1"); expect(screen.getByLabelText("Фотография")).toHaveAttribute("accept","image/jpeg,image/png,image/webp");});
 test("supports explicit ordering buttons",()=>{const onChange=vi.fn(); render(<SortableList items={[{id:1,label:"Хелперы"},{id:2,label:"Официанты"}]} onChange={onChange}/>); fireEvent.click(screen.getByRole("button",{name:"Переместить Официанты вверх"})); expect(onChange).toHaveBeenCalledWith([2,1]);});
});
