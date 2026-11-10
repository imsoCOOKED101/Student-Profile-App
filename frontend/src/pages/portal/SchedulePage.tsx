import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type Schedule } from "@/lib/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
const tones = ["blue", "green", "purple", "orange", "pink"];

export default function SchedulePage() {
  const [week, setWeek] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ schedules: Schedule[] }>("/schedules")
      .then(({ schedules: records }) => setSchedules(records))
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, []);

  const weekDays = useMemo(() => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + week * 7);
    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        day,
        date,
        label: `${day.slice(0, 3)} ${date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}`,
      };
    });
  }, [week]);

  const weekLabel = `${weekDays[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${weekDays.at(-1)?.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <>
      <PageTitle title="Class Schedules" subtitle="Your weekly class timetable." />
      <section className="panel full-panel calendar-panel">
        <div className="calendar-toolbar">
          <div className="week-controls">
            <button className="icon-button" aria-label="Previous week" onClick={() => setWeek(week - 1)} type="button"><Icon name="chevron-left" /></button>
            <button className="icon-button" aria-label="Next week" onClick={() => setWeek(week + 1)} type="button"><Icon name="chevron-right" /></button>
            <strong>{week === 0 ? `Week of ${weekLabel}` : `${weekLabel} · Week ${week > 0 ? "+" : ""}${week}`}</strong>
            <button className="button button-subtle" onClick={() => setWeek(0)} type="button">Today</button>
          </div>
          <div className="view-switch"><button className="selected" type="button">Week</button><button type="button">List</button></div>
        </div>
        {error && <p className="portal-message error" role="alert">{error}</p>}
        <div className="calendar-scroll">
          <div className="calendar-grid">
            <div className="calendar-corner">Time</div>
            {weekDays.map(({ label }) => <div className="calendar-day" key={label}>{label}</div>)}
            {hours.map((hour, hourIndex) => (
              <div className="calendar-row" key={hour}>
                <div className="calendar-hour">{hour}</div>
                {weekDays.map(({ day }) => (
                  <div className="calendar-cell" key={`${day}-${hour}`}>
                    {schedules
                      .filter((schedule) => schedule.day.toLowerCase() === day.toLowerCase() && parseInt(schedule.start_time.slice(0, 2), 10) - 7 === hourIndex)
                      .map((schedule) => (
                        <div
                          className={`calendar-event ${tones[schedule.subject.id % tones.length]}`}
                          key={schedule.id}
                          style={{ height: `${durationInHours(schedule) * 42 - 8}px` }}
                        >
                          <strong>{schedule.subject.subject_code}</strong>
                          <span>{schedule.subject.subject_title}</span>
                          <small>{schedule.room}</small>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {schedules.length === 0 && !error && <p className="empty-inline">No class schedules found.</p>}
        </div>
      </section>
    </>
  );
}

function durationInHours(schedule: Schedule): number {
  const [startHour, startMinute] = schedule.start_time.split(":").map(Number);
  const [endHour, endMinute] = schedule.end_time.split(":").map(Number);
  return Math.max(1, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
}
