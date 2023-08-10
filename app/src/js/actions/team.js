export function updateTeam(teamId, updatedTeam) {
  return {
    type: 'UPDATE_TEAM',
    payload: { ...updatedTeam, teamId },
    sync: teamId,
  }
}

export function deleteTeam(teamId, sync) {
  return {
    type: 'DELETE_TEAM',
    payload: { teamId },
    sync: sync ? teamId : null,
  }
}

export function hydrateTeam(team) {
  return {
    type: 'TEAM',
    payload: team,
  }
}

export function createTeam(team) {
  return {
    type: 'CREATE_TEAM',
    payload: team,
  }
}

export function updateTeamMemberPosition(position) {
  return {
    type: 'UPDATE_TEAM_MEMBER_POSITION',
    payload: { position },
  }
}

export function updateTeamMemberRole(role) {
  return {
    type: 'UPDATE_TEAM_MEMBER_ROLE',
    payload: { role },
  }
}
