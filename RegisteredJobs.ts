import { registerJobs } from "./jobs/JobRegistrator";
import { CheckLiveJob } from "./twitch/CheckLiveJob";

export const registeredJobs = registerJobs(new CheckLiveJob());