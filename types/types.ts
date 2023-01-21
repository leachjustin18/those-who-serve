export type TJobs = { id: string; friendlyName: string; name: string };

export type TAPIAddJob = {
  id: string;
  jobFriendlyName: string;
  jobNumberOfServants: number;
  name: string;
};

export type TAddJobFormInputs = {
  jobFriendlyName: string;
  jobNumberOfServants: number;
};
