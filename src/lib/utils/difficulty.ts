export function getDifficulty(throwType: string): { label: string; color: string } {
  switch (throwType) {
    case 'jumpthrow':
      return { label: 'Средне', color: '#e8d44d' }
    case 'runthrow':
      return { label: 'Сложно', color: '#e05a3a' }
    case 'walkthrow':
      return { label: 'Средне', color: '#e8d44d' }
    default:
      return { label: 'Легко', color: '#5cbf4a' }
  }
}
