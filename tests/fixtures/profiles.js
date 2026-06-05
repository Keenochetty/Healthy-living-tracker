const profiles = {
  adultSelf: { id: "profile-self", profileType: "self", ownerUserId: "local-user" },
  child: { id: "profile-child", profileType: "child", ownerUserId: "local-user" },
  caregiver: { id: "caregiver-contact", profileType: "caregiver_contact", ownerUserId: "other-user" }
};

module.exports = { profiles };
