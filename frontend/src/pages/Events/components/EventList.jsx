import EventCard from "./EventCard.jsx";
// import { EVENT_CARDS } from '../data.js';

export default function EventList({ events }) {
  return (
    <section id="event-cards">
      <ul>
        {events.map((eventItem) => (
          <EventCard key={eventItem.id} {...eventItem} />
        ))}
      </ul>
    </section>
  );
}
