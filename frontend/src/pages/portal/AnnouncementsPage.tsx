import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { apiRequest, errorMessage, type Announcement } from "@/lib/api";

const categories = ["All", "Academic", "Department", "Campus", "Scholarship"];

export default function AnnouncementsPage() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [selected, setSelected] = useState("All");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const categoryQuery = selected === "All" ? "" : `?category=${encodeURIComponent(selected)}`;
    apiRequest<{ data: Announcement[] }>(`/announcements${categoryQuery}`)
      .then(({ data }) => setAnnouncements(data))
      .catch((requestError: unknown) => setError(errorMessage(requestError)));
  }, [selected]);

  return (
    <>
      <PageTitle title="Announcement" subtitle="Stay up to date with the latest campus news." />
      <section className="panel full-panel notices-panel">
        <div className="tab-bar">
          <button className={tab === "all" ? "tab active" : "tab"} onClick={() => setTab("all")} type="button">All Announcements</button>
          <button className={tab === "mine" ? "tab active" : "tab"} onClick={() => setTab("mine")} type="button">My Announcements</button>
        </div>
        {tab === "all" && <div className="filter-row">
          {categories.map((category) => <button className={selected === category ? "filter-chip selected" : "filter-chip"} key={category} onClick={() => setSelected(category)} type="button">{category}</button>)}
        </div>}
        {error && <p className="portal-message error" role="alert">{error}</p>}
        {tab === "all" ? announcements.map((announcement, index) => {
          const tone = ["blue", "green", "purple", "orange"][index % 4];
          return (
            <article className="notice-item" key={announcement.id}>
              <span className={`announcement-icon large ${tone}`}><Icon name="bell" size={17} /></span>
              <div className="notice-copy">
                <div className="notice-title-line"><h2>{announcement.title}</h2><span className={`tiny-tag ${tone}`}>{announcement.type}</span></div>
                <p>{announcement.message}</p>
                <small>{new Date(announcement.published_at).toLocaleString()}</small>
              </div>
            </article>
          );
        }) : <p className="empty-notices">There are no announcements for your account!.</p>}
        {tab === "all" && announcements.length === 0 && !error && <p className="empty-notices">No current announcements.</p>}
      </section>
    </>
  );
}
