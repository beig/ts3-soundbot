export interface Health {
  status: Status;
  files: number;
  online: boolean;
}

export enum Status {
  ONLINE = 'Online',
  OFFLINE = 'Offline'
}
