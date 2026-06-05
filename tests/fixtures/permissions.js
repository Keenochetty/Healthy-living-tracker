const permissions = [
  { category: "records", level: "view", profileId: "profile-child", userId: "local-user" },
  { category: "baby_child", level: "manage", profileId: "profile-child", userId: "local-user" },
  { category: "womens_health", level: "none", profileId: "profile-self", userId: "caregiver-user" }
];

module.exports = { permissions };
