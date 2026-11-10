import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type Subject } from "@/lib/api";

export default function SubjectsPage() {
  const [tab, setTab] = useState<"enrolled" | "completed">("enrolled");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ subjects: Subject[] }>(`/subjects?status=${tab}`)
      .then(({ subjects: records }) => setSubjects(records))
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, [tab]);

  return (
    <>
      <PageTitle title="My Subjects" subtitle="Review your enrolled and completed subjects." />
      <section className="panel full-panel subjects-panel">
        <div className="tab-bar">
          <button className={tab === "enrolled" ? "tab active" : "tab"} onClick={() => setTab("enrolled")} type="button">Enrolled Subjects</button>
          <button className={tab === "completed" ? "tab active" : "tab"} onClick={() => setTab("completed")} type="button">Completed Subjects</button>
        </div>
        {error && <p className="portal-message error" role="alert">{error}</p>}
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Subject Code</th><th>Subject Title</th><th>Units</th><th>Instructor</th><th>Schedule</th><th>Room</th><th>Status</th></tr></thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_title}</td>
                  <td>{subject.units}</td>
                  <td>{subject.instructor}</td>
                  <td>{subject.schedules.map((schedule) => `${schedule.day.slice(0, 3)} ${schedule.start_time.slice(0, 5)}`).join(", ") || "—"}</td>
                  <td>{subject.schedules.map((schedule) => schedule.room).join(", ") || "—"}</td>
                  <td><span className="status-pill">{subject.pivot.status}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={7}>Total Units: {subjects.reduce((total, subject) => total + Number(subject.units), 0)}</td></tr></tfoot>
          </table>
          {subjects.length === 0 && !error && <p className="empty-inline">No {tab} subjects found.</p>}
        </div>
      </section>
    </>
  );
}
