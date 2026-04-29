import NetworkSection from "@/components/shared/NetworkSection";

const ALREADY = [
  { id: "a1", name: "Sarah Chen", detail: "Looking for VP Product at a Series B+" },
  { id: "a2", name: "Marcus Johnson", detail: "Looking for Engineering Director" },
  { id: "a3", name: "Aisha Patel", detail: "Looking for ML Engineering Lead" },
];
const NOT_YET = [
  { id: "n1", name: "James Wu", detail: "" },
  { id: "n2", name: "Emily Rivera", detail: "" },
];
const INVITES = [
  { id: "i1", name: "Devon Park", email: "devon@gmail.com", date: "Apr 18, 2026", status: "Invited" as const },
  { id: "i2", name: "Maya Kim", email: "maya@example.com", date: "Apr 12, 2026", status: "Joined" as const },
];

const NetworkTab = () => (
  <NetworkSection
    uploadHeadline="Find lookers you already know"
    uploadSubheadline="Upload your LinkedIn connections and we'll show you who on Refr you could be referring right now."
    emptyText="Upload your LinkedIn connections to instantly see which lookers on Refr you already know."
    alreadyOnRefr={ALREADY}
    notOnRefr={NOT_YET}
    connectButtonLabel="I know this person"
    sentInvites={INVITES}
  />
);

export default NetworkTab;
