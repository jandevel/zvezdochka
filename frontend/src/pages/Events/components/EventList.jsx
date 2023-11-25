import EventCard from "./EventCard.jsx";
import { EVENT_CARDS } from '../data.js';

export default function EventList() {
  return (
    <section id="event-cards">
      <ul>
        {EVENT_CARDS.map((eventItem) => (
          <EventCard key={eventItem.id} {...eventItem} />
        ))}
      </ul>
    </section>
  );
}
