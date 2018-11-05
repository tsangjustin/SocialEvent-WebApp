import { CommentRecord } from "./comment";
import { LocationRecord } from "./location";

export interface EventRecord {
  _id: string;
  name: string;
  creatorId: string;
  description: string;
  date: number;
  location: LocationRecord;
  locationName: string;
  comments: CommentRecord[];
  userGoing: string[]; // array of uuid
}
