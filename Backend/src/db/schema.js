import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

//
// ENUMS
//
export const roleEnum = pgEnum("role", ["ADMIN", "VOTER"]);

export const electionTypeEnum = pgEnum("election_type", [
  "LOCAL",
  "PROVINCIAL",
  "FEDERAL",
]);

export const districtEnum = pgEnum("district", [
  "KATHMANDU",
  "LALITPUR",
  "BHAKTAPUR",
  "BARA",
  "POKHARA",
  "CHITWAN",
  "DHANKUTA",
  "MORANG",
  "SURKHET",
  "BHAIRAHAWA",
  "KAILALI",
  "KANCHANPUR",
  "SOLUKHUMBU",
  "TANAHU",
  "NUWAKOT",
  "SINDHUPALCHOK",
  "MAKWANPUR",
  "RAMECHHAP",
  "DHADING",
  "PALPA",
]);

export const electionStatusEnum = pgEnum("election_status", [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
]);

//
// USERS TABLE
//
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).unique().notNull(),

  password: varchar("password", { length: 255 }).notNull(),

  role: roleEnum("role").default("VOTER").notNull(),

  dob: timestamp("dob").notNull(),

  district: districtEnum("district").notNull(),

  citizenNo: varchar("citizen_no", { length: 255 })
    .unique()
    .notNull(),

  photoUrl: text("photo_url").notNull(),

  faceDescriptor: text("face_descriptor"),

  hasVoted: boolean("has_voted").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// CANDIDATES TABLE
//
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  party: varchar("party", { length: 255 }).notNull(),

  position: varchar("position", { length: 255 }).notNull(),

  district: districtEnum("district").notNull(),

  photoUrl: text("photo_url").notNull(),

  bio: text("bio").notNull(),

  electionId: integer("election_id").notNull(),

  voteCount: integer("vote_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// ELECTIONS TABLE
//
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description").notNull(),

  type: electionTypeEnum("type").notNull(),

  status: electionStatusEnum("status")
    .default("UPCOMING")
    .notNull(),

  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//
// ELECTION ↔ CANDIDATES (MANY-TO-MANY)
//
export const electionCandidates = pgTable(
  "election_candidates",
  {
    id: serial("id").primaryKey(),

    electionId: integer("election_id")
      .references(() => elections.id, { onDelete: "cascade" })
      .notNull(),

    candidateId: integer("candidate_id")
      .references(() => candidates.id, { onDelete: "cascade" })
      .notNull(),
  }
);

//
// VOTES TABLE (MOST IMPORTANT)
//
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    candidateId: integer("candidate_id")
      .references(() => candidates.id, { onDelete: "cascade" })
      .notNull(),

    electionId: integer("election_id")
      .references(() => elections.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueVote: uniqueIndex("one_vote_per_user_per_election").on(
      table.userId,
      table.electionId
    ),
  })
);