import { useApiResource } from '../api/useApiResource.js';

type Workout = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  const email = 'mona@example.com';
  const path = `/api/workouts/suggestions/${encodeURIComponent(email)}`;
  const { data, error, loading } = useApiResource<{ suggestions: Workout[] }>(path);
  const suggestions = data?.suggestions ?? [];

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Workout suggestions</h2>
    <p>Recommend workouts from activity patterns.</p>
    {loading ? <p role="status">Loading workout suggestions...</p> : error ? <p role="alert">Unable to load workout suggestions: {error}</p> : suggestions.length === 0 ? <p>No workout suggestions yet.</p> :
      <ul className="list-group list-group-flush">{suggestions.map((workout, index) => <li className="list-group-item px-0" key={workout._id ?? `${workout.title}-${index}`}>
        <strong>{workout.title}</strong><div>{workout.focus} · {workout.minutes} min · {workout.difficulty}</div><p className="mb-0">{workout.reason}</p>
      </li>)}</ul>}
  </div></section>;
}
