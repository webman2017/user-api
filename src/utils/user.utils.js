module.exports = {
  async subMobileNumber(mobile) {
    const subStringMobile =
      mobile.length == 11
        ? mobile.substring(2, 11)
        : mobile.length == 10
        ? mobile.substring(1, 10)
        : mobile.length == 12
        ? mobile.substring(3, 12)
        : mobile;
    return subStringMobile;
  },
  async queryUser(type, phoneNumber, socialId) {
    const mobileQuery = { vPhone: phoneNumber };
    let query = {
      mobile: mobileQuery,
      facebook: { vFbId: socialId, facebook: "active" },
      google: { google_id: socialId, google: "active" },
      apple: { apple_id: socialId, apple: "active" },
    }[type];
    return query;
  },
  async updateSocialId(type, socialId, status) {
    let query = {
      facebook: { vFbId: socialId, facebook: status },
      google: { google_id: socialId, google: status },
      apple: { apple_id: socialId, apple: status },
    }[type];
    return query;
  },
  async createUser(data, phoneNumber) {
    const { firstName, lastName, email, img, type, socialId } = data;
    const baseCreate = {
      vName: firstName,
      vLastName: lastName,
      vEmail: email,
      vPhone: phoneNumber,
      vImgName: img,
    };
    let query = {
      facebook: { ...baseCreate, vFbId: socialId, facebook: "active" },
      google: { ...baseCreate, google_id: socialId, google: "active" },
      apple: { ...baseCreate, apple_id: socialId, apple: "active" },
      mobile: { ...baseCreate },
    }[type];
    return query;
  },
};
