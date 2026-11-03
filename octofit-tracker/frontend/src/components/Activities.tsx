import { useApiResource } from '../api/useApiResource.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };

export default function Activities() {
  const { data, error, loading } = useApiResource<{ activities: Activity[] }>('/api/activities');
  const activities = data?.activities ?? [];

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Activities</h2>
    <p>Track student activity minutes and points.</p>
    {loading ? <p role="status">Loading activities...</p> : error ? <p role="alert">Unable to load activities: {error}</p> : activities.length === 0 ? <p>No activities yet.</p> :
      <ul className="list-group list-group-flush">{activities.map((activity, index) => <li className="list-group-item px-0" key={activity._id ?? `${activity.type}-${activity.minutes}-${index}`}>
        <strong>{activity.type}</strong> · {activity.minutes} min · {activity.points} points
      </li>)}</ul>}
  </div></section>;
}
