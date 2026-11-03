import { useApiResource } from '../api/useApiResource.js';

type Team = { _id?: string; name: string; mascot?: string; members?: string[] };

export default function Teams() {
  const { data, error, loading } = useApiResource<{ teams: Team[] }>('/api/teams');
  const teams = data?.teams ?? [];

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Teams</h2>
    <p>Manage teams and members.</p>
    {loading ? <p role="status">Loading teams...</p> : error ? <p role="alert">Unable to load teams: {error}</p> : teams.length === 0 ? <p>No teams yet.</p> :
      <ul className="list-group list-group-flush">{teams.map((team, index) => <li className="list-group-item px-0" key={team._id ?? `${team.name}-${index}`}>
        <strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''}<div>Members: {team.members?.join(', ') || 'None'}</div>
      </li>)}</ul>}
  </div></section>;
}
