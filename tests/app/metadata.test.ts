import { metadata } from "@/app/layout";

const title = "Персонал для мероприятий в Москве | EVENT CREW";
const description = "Подбор хостес, промоутеров, координаторов, официантов и другого персонала для мероприятий в Москве.";

it("exposes the approved Russian search and sharing metadata", () => {
  expect(metadata.title).toBe(title);
  expect(metadata.description).toBe(description);
  expect(metadata.openGraph).toMatchObject({
    title,
    description,
    locale: "ru_RU",
    images: [
      {
        url: "/images/og-event-crew.png",
        alt: "EVENT CREW — персонал для вашего мероприятия",
      },
    ],
  });
});
