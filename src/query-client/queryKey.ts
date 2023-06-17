export const keys = {
  tickets: () => ['tickets'],
  ticketDetail: (id: string) => [...keys.tickets(), 'detail', id],
  updateTicket: (id: string) => [...keys.tickets(), 'update', id],
};
