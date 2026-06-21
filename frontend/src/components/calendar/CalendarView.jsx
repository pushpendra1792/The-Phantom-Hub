import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const typeColors = {
  hackathon: '#a855f7',
  meeting: '#22c55e',
  deadline: '#ef4444',
  social: '#3b82f6',
  workshop: '#f59e0b',
  default: '#a855f7',
}

export default function CalendarView({ events = [], onSelectEvent, onSelectSlot }) {
  const formattedEvents = events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
    color: typeColors[event.type] || event.color || typeColors.default,
  }))

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '4px',
      border: 'none',
      color: '#fff',
      fontSize: '12px',
      padding: '2px 4px',
    },
  })

  const dayPropGetter = () => ({
    style: {
      backgroundColor: '#111111',
      borderColor: '#2a2a2a',
    },
  })

  return (
    <div className="card p-4">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        defaultView="month"
        views={['month', 'week']}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        popup
        className="rbc-calendar"
        style={{ height: 600 }}
      />
    </div>
  )
}
