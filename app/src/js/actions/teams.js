export function hydrateTeams(teams) {
  return {
    type: 'TEAMS',
    payload: teams,
  }
}
