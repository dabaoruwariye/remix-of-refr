import NetworkSection from "@/components/shared/NetworkSection";

const ALREADY = [
  { id: "a1", name: "Priya Shah", detail: "Director of Product at Notion" },
  { id: "a2", name: "Liam Chen", detail: "Engineering Manager at Linear" },
  { id: "a3", name: "Sara Okafor", detail: "Founder, Loop Labs" },
];
const NOT_YET = [
  { id: "n1", name: "Marcus Wong", detail: "" },
  { id: "n2", name: "Elena Reyes", detail: "" },
];
const INVITES = [
  { id: "i1", name: "Alex Morgan", email: "alex@datadog.com", date: "Apr 22, 2026", status: "Joined" as const },
  { id: "i2", name: "Devon Park", email: "devon@gmail.com", date: "Apr 18, 2026", status: "Invited" as const },
];

const LookerNetworkTab = () => (
  <NetworkSection
    uploadHeadline="Want more people in your referral community?"
    uploadSubheadline="Upload your LinkedIn connections and we'll find who's already on Refr — and invite those who aren't."
    emptyText="Upload your LinkedIn connections above to instantly see who in your network is already on Refr."
    alreadyOnRefr={ALREADY}
    notOnRefr={NOT_YET}
    connectButtonLabel="Connect"
    sentInvites={INVITES}
  />
);

export default LookerNetworkTab;